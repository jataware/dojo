import io
import logging
import io
import json
import os
import re
import requests
import shutil
from urllib.parse import urlparse
import pandas as pd
import numpy as np

import sys

from utils import get_rawfile, put_rawfile, download_rawfile
from elwood import elwood as mix
from elwood import feature_normalization as scaler
from base_annotation import BaseProcessor
from settings import settings


def build_elwood_meta_from_context(context, filename=None):
    metadata = context["annotations"]["metadata"]
    if "files" in metadata:
        metadata = metadata["files"][filename]

    ftype = metadata.get("filetype", "csv")
    mapping = {
        # Geotiff
        "band": "geotiff_band_count",
        "band_name": "geotiff_value",
        "bands": "geotiff_bands",
        "date": "geotiff_date_value",
        "feature_name": "geotiff_value",
        "null_val": "geotiff_null_value",
        # Excel
        "sheet": "excel_sheet",
    }
    elwood_meta = {}
    elwood_meta["ftype"] = ftype
    if ftype == "geotiff":
        band_type = metadata.get("geotiff_band_type", "category")
        if band_type == "temporal":
            band_type = "datetime"
            date_value = None
        else:
            date_value = context.get("geotiff_date_value", "2001-01-01")
        elwood_meta["band_type"] = band_type
        elwood_meta["date"] = date_value

    for key, value in mapping.items():
        if value in metadata:
            elwood_meta[key] = metadata[value]

    if "geotiff_null_value" not in elwood_meta:
        elwood_meta["null_val"] = -9999

    return elwood_meta


class ElwoodProcessor(BaseProcessor):
    @staticmethod
    def run(context, datapath, filename) -> pd.DataFrame:
        """final full elwood implementation"""
        logging.info(f"{context.get('logging_preface', '')} - Running elwood processor")
        output_path = datapath
        mapper_fp = f"{output_path}/elwood_ready_annotations.json"  # Filename for json info, will eventually be in Elasticsearch, needs to be written to disk until elwood is updated
        raw_data_fp = f"{output_path}/{filename}"  # Raw data
        # Getting admin level to resolve to from annotations
        admin_level = None  # Default to admin1
        geo_annotations = context["annotations"]["annotations"]["geo"]
        for annotation in geo_annotations:
            if annotation["primary_geo"] and "gadm_level" in annotation:
                admin_level = annotation["gadm_level"]
                break
        uuid = context["uuid"]
        context["mapper_fp"] = mapper_fp

        # Elwood output path (it needs the filename attached to write parquets, and the file name is the uuid)
        mix_output_path = f"{output_path}/{uuid}"
        # Main elwood processing call
        ret, rename = mix.process(raw_data_fp, mapper_fp, admin_level, mix_output_path)

        ret.to_csv(f"{output_path}/elwood_processed_df.csv", index=False)

        return ret


def run_elwood(context, filename=None):
    processor = ElwoodProcessor()
    uuid = context["uuid"]
    # Creating folder for temp file storage on the rq worker since following functions are dependent on file paths
    datapath = f"./{uuid}"
    if not os.path.isdir(datapath):
        os.makedirs(datapath)

    # Copy raw data file into rq-worker
    # Could change elwood to accept file-like objects as well as filepaths.
    # To save processing time, always re-use the converted CSV file
    if filename is None:
        filename = "raw_data.csv"
        file_suffix = ""
    else:
        file_suffix_match = re.search(r"raw_data(_\d+)?\.", filename)
        if file_suffix_match:
            file_suffix = file_suffix_match.group(1) or ""
        else:
            file_suffix = ""
        filename = f"raw_data{file_suffix}.csv"

    rawfile_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, uuid, filename)

    raw_file_obj = get_rawfile(rawfile_path)
    with open(f"{datapath}/{filename}", "wb") as f:
        f.write(raw_file_obj.read())

    # Writing out the annotations because elwood needs a filepath to this data.
    # Should probably change elwood down the road to accept filepath AND annotations objects.
    mm_ready_annotations = context["annotations"]["annotations"]
    print(f"ELWOOD ANNOTATIONS: {mm_ready_annotations}")
    mm_ready_annotations["meta"] = {"ftype": "csv"}
    with open(f"{datapath}/elwood_ready_annotations.json", "w") as f:
        f.write(json.dumps(mm_ready_annotations))
    f.close()

    # Main Call
    elwood_result_df = processor.run(context, datapath, filename)

    file_suffix_match = re.search(r"raw_data(_\d+)?\.", filename)
    if file_suffix_match:
        file_suffix = file_suffix_match.group(1) or ""
    else:
        file_suffix = ""

    data_files = []
    # Takes all parquet files and puts them into the DATASET_STORAGE_BASE_URL which will be S3 in Production
    dest_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, uuid)
    for local_file in os.listdir(datapath):
        if local_file.endswith(".parquet.gzip"):
            local_file_match = re.search(rf"({uuid}(_str)?).parquet.gzip", local_file)
            if local_file_match:
                file_root = local_file_match.group(1)
            dest_file_path = os.path.join(
                dest_path, f"{file_root}{file_suffix}.parquet.gzip"
            )
            with open(os.path.join(datapath, local_file), "rb") as fileobj:
                put_rawfile(path=dest_file_path, fileobj=fileobj)
            if dest_file_path.startswith("s3:") and not os.environ.get("STORAGE_HOST"):
                # "https://jataware-world-modelers.s3.amazonaws.com/dev/indicators/6c9c996b-a175-4fa6-803c-e39b24e38b6e/6c9c996b-a175-4fa6-803c-e39b24e38b6e.parquet.gzip"
                location_info = urlparse(dest_file_path)
                data_files.append(
                    f"https://{location_info.netloc}.s3.amazonaws.com{location_info.path}"
                )
            else:
                data_files.append(dest_file_path)

    # Final cleanup of temp directory
    shutil.rmtree(datapath)

    dataset = context.get("dataset")
    if dataset.get("period", None):
        period = {
            "gte": max(
                int(elwood_result_df["timestamp"].max()),
                dataset.get("period", {}).get("gte", None),
            ),
            "lte": min(
                int(elwood_result_df["timestamp"].min()),
                dataset.get("period", {}).get("lte", None),
            ),
        }
    else:
        period = {
            "gte": int(elwood_result_df["timestamp"].max()),
            "lte": int(elwood_result_df["timestamp"].min()),
        }

    if dataset.get("geography", None):
        geography_dict = dataset.get("geography", {})
    else:
        geography_dict = {}
    for geog_type in ["admin1", "admin2", "admin3", "country"]:
        if geog_type not in geography_dict:
            geography_dict[geog_type] = []
        for value in elwood_result_df[elwood_result_df[geog_type].notna()][
            geog_type
        ].unique():
            if value == "nan" or value in geography_dict[geog_type]:
                continue
            geography_dict[geog_type].append(value)

    # Outputs
    qualifier_outputs = []
    outputs = []
    feature_names = []
    for feature in context["annotations"]["annotations"]["feature"]:

        feature_names.append(feature["name"])  # Used for the primary qualifier outputs.
        output = dict(
            name=feature["name"],
            display_name=feature["display_name"],
            description=feature["description"],
            type=feature["feature_type"],
            unit=feature["units"],
            unit_description=feature["units_description"],
            ontologies={},
            is_primary=True,
            data_resolution={
                "temporal_resolution": context.get("dataset", {}).get(
                    "temporal_resolution", None
                ),
                "spatial_resolution": context.get("dataset", {}).get(
                    "spatial_resolution", None
                ),
            },
            alias=feature["aliases"],
        )
        # Append
        # TODO: Hackish way to determine that the feature is not a qualifier
        if len(feature["qualifies"]) == 0:
            outputs.append(output)
        # Qualifier output for qualifying features
        elif len(feature["qualifies"]) > 0:
            qualifier_output = dict(
                name=feature["name"],
                display_name=feature["display_name"],
                description=feature["description"],
                # Gross conversion between the two output types.
                type=(
                    "str"
                    if feature["feature_type"] == "string"
                    else "binary"
                    if feature["feature_type"] == "boolean"
                    else feature["feature_type"]
                ),
                unit=feature["units"],
                unit_description=feature["units_description"],
                ontologies={},
                related_features=feature["qualifies"],
            )
            # Append to qualifier outputs
            qualifier_outputs.append(qualifier_output)

    # Qualifier_outputs
    for date in context["annotations"]["annotations"]["date"]:
        if date["primary_date"]:
            qualifier_output = dict(
                name=date["name"],
                display_name=date["display_name"],
                description=date["description"],
                type="datetime",
                unit=date.get("units", None),
                unit_description=date.get("units_description", None),
                ontologies={},
                related_features=feature_names,
                # Extra field (Schema allows extras)
                qualifier_role="breakdown",
            )
            # Append
            qualifier_outputs.append(qualifier_output)

    # TODO potentially update description dynamically if present in annotations
    for geo_str in ["country", "admin1", "admin2", "admin3", "lat", "lng"]:
        qualifier_output = dict(
            name=geo_str,
            display_name=geo_str,
            description="location",
            type=geo_str,
            unit=None,
            unit_description=None,
            ontologies={},
            related_features=feature_names,
            # Extra field (Schema allows extras)
            qualifier_role="breakdown",
        )
        # Append
        qualifier_outputs.append(qualifier_output)

    response = {
        "preview": elwood_result_df.head(100).to_json(),
        "data_files": data_files,
        "period": period,
        "geography": geography_dict,
        "outputs": outputs,
        "qualifier_outputs": qualifier_outputs,
        "feature_names": feature_names,
    }
    return response


def run_model_elwood(context, *args, **kwargs):
    metadata = context["annotations"]["metadata"]
    processor = ElwoodProcessor()
    filename = f"{metadata['file_uuid']}.csv"
    datapath = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, "model-output-samples", context["uuid"]
    )
    sample_path = os.path.join(datapath, filename)
    # Creating folder for temp file storage on the rq worker since following functions are dependent on file paths
    localpath = f"/datasets/processing/{context['uuid']}"
    if not os.path.isdir(localpath):
        os.makedirs(localpath)

    # Copy raw data file into rq-worker
    # Could change elwood to accept file-like objects as well as filepaths.
    # rawfile_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, filename)
    raw_file_obj = get_rawfile(sample_path)
    with open(f"{localpath}/raw_data.csv", "wb") as f:
        f.write(raw_file_obj.read())

    # Writing out the annotations because elwood needs a filepath to this data.
    # Should probably change elwood down the road to accept filepath AND annotations objects.
    mm_ready_annotations = context["annotations"]["annotations"]
    mm_ready_annotations["meta"] = {"ftype": "csv"}
    import pprint

    logging.warn(pprint.pformat(mm_ready_annotations))

    # annotation_file = get_rawfile(os.path.join(datapath), )
    with open(f"{localpath}/elwood_ready_annotations.json", "w") as f:
        f.write(json.dumps(mm_ready_annotations))
    f.close()

    # Main Call
    elwood_result_df = processor.run(context, localpath, "raw_data.csv")

    # Takes all parquet files and puts them into the DATASET_STORAGE_BASE_URL which will be S3 in Production
    for file in os.listdir(localpath):
        if file.endswith(".parquet.gzip"):
            with open(os.path.join(localpath, file), "rb") as fileobj:
                dest_path, parquet_filename = os.path.split(sample_path)
                dest = os.path.join(dest_path, f"{metadata['file_uuid']}.parquet.gzip")
                put_rawfile(path=dest, fileobj=fileobj)

    # Final cleanup of temp directory
    shutil.rmtree(localpath)

    response = {"mixmaster_annotations": mm_ready_annotations}
    return response


def scale_features(context, filename=None):
    # 0 to 1 scaled dataframe

    uuid = context["uuid"]
    # All datapaths need to be collapsed into one key-dict pair, but doing it this
    # way preserves backwards compatibility for downstream tools.
    data_paths = context["dataset"]["data_paths"]
    data_paths_normalized = context["dataset"].get("data_paths_normalized", [])
    data_paths_normalized_robust = context["dataset"].get(
        "data_paths_normalized_robust", []
    )
    api_url = os.environ.get("DOJO_HOST")

    if not data_paths_normalized:
        data_paths_normalized = []

    if not data_paths:
        request_response = requests.get(f"{api_url}/indicators/{context['uuid']}")
        data_paths = request_response.json().get("data_paths")

    # determine which files have a normalized equivalent
    data_paths_not_str = [path for path in data_paths if "_str" not in path]

    # figure out which files paths are have been normalized
    # and which are new files that are not yet normalized
    old_files_normed = generate_files_list(
        data_paths_not_str=data_paths_not_str,
        normalized_paths_list=data_paths_normalized,
        target_suffix="_normalized.parquet.gzip",
    )

    new_files_not_normed = [
        path for path in data_paths_not_str if path not in old_files_normed
    ]

    data_paths_normalized = scaling_core(
        uuid=uuid,
        new_files_not_normed=new_files_not_normed,
        old_files_normed=old_files_normed,
        scaling_method=scaler.zero_to_one_normalization,
    )

    # figure out which files paths are have been normalized_robust
    # and which are new files that are not yet normalized_robust
    old_files_normed = generate_files_list(
        data_paths_not_str=data_paths_not_str,
        normalized_paths_list=data_paths_normalized_robust,
        target_suffix="_normalized_robust.parquet.gzip",
    )

    new_files_not_normed = [
        path for path in data_paths_not_str if path not in old_files_normed
    ]

    data_paths_normalized_robust = scaling_core(
        uuid=uuid,
        new_files_not_normed=new_files_not_normed,
        old_files_normed=old_files_normed,
        scaling_method=scaler.robust_normalization,
        file_ending="_normalized_robust.parquet.gzip",
    )

    results_dictionary = {
        "data_paths_normalized": data_paths_normalized,
        "data_paths_normalized_robust": data_paths_normalized_robust,
    }

    return results_dictionary


def scaling_core(
    uuid,
    new_files_not_normed,
    old_files_normed,
    scaling_method,
    scaling_method_options=None,
    file_ending="_normalized.parquet.gzip",
):
    # generate mapping from the old and new files
    old_mapping = generate_min_max_mapping(old_files_normed)

    new_mapping = generate_min_max_mapping(new_files_not_normed)

    if new_min_max_values_found(old_mapping=old_mapping, new_mapping=new_mapping):
        files_to_process = new_files_not_normed + old_files_normed
    else:
        files_to_process = new_files_not_normed

    # rescale files that need processing
    for path in files_to_process:
        logging.warn(path)
        filename = path.split("/")[-1]
        file_name = path.split("/")[-1].split(".parquet")[0]
        file_out_name = file_name + file_ending

        # Creating folder for temp file storage on the rq worker since following functions are dependent on file paths
        localpath = f"/datasets/processing/{uuid}"
        localfile = os.path.join(localpath, filename)
        local_outfile = os.path.join(localpath, file_out_name)

        if not os.path.isdir(localpath):
            os.makedirs(localpath)

        # Copy raw data file into rq-worker
        # Could change elwood to accept file-like objects as well as filepaths.
        raw_file_obj = get_rawfile(path)

        dataframe = pd.read_parquet(raw_file_obj)

        if scaling_method_options:
            dataframe_scaled = scaling_method(dataframe, **scaling_method_options)
        else:
            dataframe_scaled = scaling_method(dataframe)

        s3_filepath = os.path.join(
            settings.DATASET_STORAGE_BASE_URL, "normalized", uuid, file_out_name
        )

        file_buffer = io.BytesIO()

        dataframe_scaled.to_parquet(file_buffer)
        file_buffer.seek(0)

        put_rawfile(path=s3_filepath, fileobj=file_buffer)

    data_paths_normalized = []
    for path in new_files_not_normed + old_files_normed:
        file_name = path.split("/")[-1].split(".parquet")[0]
        file_out_name = file_name + file_ending
        s3_filepath = os.path.join(
            settings.DATASET_STORAGE_BASE_URL, "normalized", uuid, file_out_name
        )
        data_paths_normalized.append(s3_filepath)

    return data_paths_normalized


def generate_min_max_mapping(array_of_paths):
    current_min = None
    current_max = None
    mapper = {}
    for path in array_of_paths:
        filename = path.split("/")[-1]
        try:
            print(path)
            download_rawfile(path, f"processing/{filename}")
        except FileNotFoundError as e:
            return {"success": False, "message": "File not found"}

        current_df = pd.read_parquet(f"processing/{filename}")

        features = current_df.feature.unique()
        for f in features:
            feat = current_df[current_df["feature"] == f]
            current_min = np.min(feat["value"])
            current_max = np.max(feat["value"])
            mapper[f] = {
                "min": min(current_min, mapper.get(f, {}).get("min", current_min)),
                "max": max(current_max, mapper.get(f, {}).get("max", current_max)),
            }
    return mapper


def new_min_max_values_found(old_mapping, new_mapping):
    if new_mapping == {}:
        return False
    if old_mapping == {}:
        return True

    for f in new_mapping:
        if new_mapping[f].get("min") < old_mapping[f].get("min"):
            return True
        if new_mapping[f].get("max") > old_mapping[f].get("max"):
            return True
    return False


def generate_files_list(data_paths_not_str, normalized_paths_list, target_suffix):

    files_list = [
        path
        for path in data_paths_not_str
        for norm_path in normalized_paths_list
        if str(path.split("/")[-1].split(".parquet")[0] + target_suffix)
        == norm_path.split("/")[-1]
    ]

    return files_list
