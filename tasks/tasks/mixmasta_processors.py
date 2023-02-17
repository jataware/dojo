import logging
import io
import json
import os
import re
import requests
import shutil
from urllib.parse import urlparse

import pandas as pd

from utils import get_rawfile, put_rawfile
from elwood import elwood as mix
from base_annotation import BaseProcessor
from settings import settings


def build_mixmasta_meta_from_context(context, filename=None):
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
    mixmasta_meta = {}
    mixmasta_meta["ftype"] = ftype
    if ftype == "geotiff":
        band_type = metadata.get("geotiff_band_type", "category")
        if band_type == "temporal":
            band_type = "datetime"
            date_value = None
        else:
            date_value = context.get("geotiff_date_value", "2001-01-01")
        mixmasta_meta["band_type"] = band_type
        mixmasta_meta["date"] = date_value

    for key, value in mapping.items():
        if value in metadata:
            mixmasta_meta[key] = metadata[value]

    if "geotiff_null_value" not in mixmasta_meta:
        mixmasta_meta["null_val"] = -9999

    return mixmasta_meta


class MixmastaProcessor(BaseProcessor):
    @staticmethod
    def run(context, datapath, filename) -> pd.DataFrame:
        """final full mixmasta implementation"""
        logging.info(
            f"{context.get('logging_preface', '')} - Running mixmasta processor"
        )
        output_path = datapath
        mapper_fp = f"{output_path}/mixmasta_ready_annotations.json"  # Filename for json info, will eventually be in Elasticsearch, needs to be written to disk until mixmasta is updated
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

        # Mixmasta output path (it needs the filename attached to write parquets, and the file name is the uuid)
        mix_output_path = f"{output_path}/{uuid}"
        # Main mixmasta processing call
        ret, rename = mix.process(raw_data_fp, mapper_fp, admin_level, mix_output_path)

        ret.to_csv(f"{output_path}/mixmasta_processed_df.csv", index=False)

        return ret


def run_mixmasta(context, filename=None):
    processor = MixmastaProcessor()
    uuid = context["uuid"]
    # Creating folder for temp file storage on the rq worker since following functions are dependent on file paths
    datapath = f"./{uuid}"
    if not os.path.isdir(datapath):
        os.makedirs(datapath)

    # Copy raw data file into rq-worker
    # Could change mixmasta to accept file-like objects as well as filepaths.
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

    # Writing out the annotations because mixmasta needs a filepath to this data.
    # Should probably change mixmasta down the road to accept filepath AND annotations objects.
    mm_ready_annotations = context["annotations"]["annotations"]
    mm_ready_annotations["meta"] = {"ftype": "csv"}
    with open(f"{datapath}/mixmasta_ready_annotations.json", "w") as f:
        f.write(json.dumps(mm_ready_annotations))
    f.close()

    # Main Call
    mixmasta_result_df = processor.run(context, datapath, filename)

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
            if dest_file_path.startswith("s3:"):
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
                int(mixmasta_result_df["timestamp"].max()),
                dataset.get("period", {}).get("gte", None),
            ),
            "lte": min(
                int(mixmasta_result_df["timestamp"].min()),
                dataset.get("period", {}).get("lte", None),
            ),
        }
    else:
        period = {
            "gte": int(mixmasta_result_df["timestamp"].max()),
            "lte": int(mixmasta_result_df["timestamp"].min()),
        }

    if dataset.get("geography", None):
        geography_dict = dataset.get("geography", {})
    else:
        geography_dict = {}
    for geog_type in ["admin1", "admin2", "admin3", "country"]:
        if geog_type not in geography_dict:
            geography_dict[geog_type] = []
        for value in mixmasta_result_df[mixmasta_result_df[geog_type].notna()][
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
        "preview": mixmasta_result_df.head(100).to_json(),
        "data_files": data_files,
        "period": period,
        "geography": geography_dict,
        "outputs": outputs,
        "qualifier_outputs": qualifier_outputs,
        "feature_names": feature_names,
    }
    return response


def run_model_mixmasta(context, *args, **kwargs):
    metadata = context["annotations"]["metadata"]
    processor = MixmastaProcessor()
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
    # Could change mixmasta to accept file-like objects as well as filepaths.
    # rawfile_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, filename)
    raw_file_obj = get_rawfile(sample_path)
    with open(f"{localpath}/raw_data.csv", "wb") as f:
        f.write(raw_file_obj.read())

    # Writing out the annotations because mixmasta needs a filepath to this data.
    # Should probably change mixmasta down the road to accept filepath AND annotations objects.
    mm_ready_annotations = context["annotations"]["annotations"]
    mm_ready_annotations["meta"] = {"ftype": "csv"}
    import pprint

    logging.warn(pprint.pformat(mm_ready_annotations))

    # annotation_file = get_rawfile(os.path.join(datapath), )
    with open(f"{localpath}/mixmasta_ready_annotations.json", "w") as f:
        f.write(json.dumps(mm_ready_annotations))
    f.close()

    # Main Call
    mixmasta_result_df = processor.run(context, localpath, "raw_data.csv")

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


# Geo clipping transformation job
def clip_geo(context, filename=None, **kwargs):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    file = get_rawfile(rawfile_path)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    shape_list = kwargs.get("map_shapes", [])
    geo_columns = kwargs.get("geo_columns", [])

    if shape_list and geo_columns:
        clipped_df = mix.clip_data(
            dataframe=original_dataframe,
            geo_columns=geo_columns,
            polygons_list=shape_list,
        )

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(clipped_df.index)

        # Make a filepath to persist the original file.
        original_file_path = os.path.join(
            settings.DATASET_STORAGE_BASE_URL,
            context["uuid"],
            filename.split(".")[0] + "_unclipped.csv",
        )
        put_rawfile(original_file_path, file)

        # Put the new clipped file to overwrite the old one.
        file_buffer = io.BytesIO()

        clipped_df.to_csv(file_buffer)
        file_buffer.seek(0)

        put_rawfile(path=rawfile_path, fileobj=file_buffer)

        response = {
            "messsage": "Geography clipped successfully",
            "preview": json_dataframe_preview,
            "rows_post_clip": rows_post_clip,
        }
        return response

    response = {
        "message": "Geography not clipped, some information was not provided (shape list or geography column names).",
        "dataframe": original_dataframe.to_json(),
    }
    return response


# Time clipping transformation job
def clip_time(context, filename=None, **kwargs):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    file = get_rawfile(rawfile_path)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    time_column = kwargs.get("time_column", "")
    time_ranges = kwargs.get("time_ranges", [])

    if time_column and time_ranges:
        clipped_df = mix.clip_dataframe_time(
            dataframe=original_dataframe,
            time_collumn=time_column,
            time_ranges=time_ranges,
        )

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(clipped_df.index)

        # Make a filepath to persist the original file.
        original_file_path = os.path.join(
            settings.DATASET_STORAGE_BASE_URL,
            context["uuid"],
            filename.split(".")[0] + "_unclipped.csv",
        )
        put_rawfile(original_file_path, file)

        # Put the new clipped file to overwrite the old one.
        file_buffer = io.BytesIO()

        clipped_df.to_csv(file_buffer)
        file_buffer.seek(0)

        put_rawfile(path=rawfile_path, fileobj=file_buffer)

        response = {
            "messsage": "Time clipped successfully",
            "preview": json_dataframe_preview,
            "rows_post_clip": rows_post_clip,
        }
        return response

    response = {
        "message": "Time values not clipped, some information was not provided (time column or time range list).",
        "dataframe": json.loads(json.dumps(original_dataframe)),
    }
    return response


# Time rescaling transformation job
def scale_time(context, filename=None, **kwargs):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    file = get_rawfile(rawfile_path)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("time_column", "")
    time_bucket = kwargs.get("time_bucket", "")
    aggregation_list = kwargs.get("aggregation_function_list", [])

    if time_column and time_bucket and aggregation_list:
        clipped_df = mix.rescale_dataframe_time(
            dataframe=original_dataframe,
            time_column=time_column,
            time_bucket=time_bucket,
            aggregation_function_list=aggregation_list,
        )

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)

        # Make a filepath to persist the original file.
        original_file_path = os.path.join(
            settings.DATASET_STORAGE_BASE_URL,
            context["uuid"],
            filename.split(".")[0] + "_unclipped.csv",
        )
        put_rawfile(original_file_path, file)

        # Put the new clipped file to overwrite the old one.
        file_buffer = io.BytesIO()

        clipped_df.to_csv(file_buffer)
        file_buffer.seek(0)

        put_rawfile(path=rawfile_path, fileobj=file_buffer)

        response = {
            "messsage": "Time rescaled successfully",
            "preview": json_dataframe_preview,
        }
        return response

    response = {
        "message": "Time not rescaled, some information was not provided (time column, time bucket, or aggregation function list).",
        "dataframe": json.loads(json.dumps(original_dataframe)),
    }
    return response


def get_boundary_box(context, filename=None, **kwargs):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    file = get_rawfile(rawfile_path)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    geo_columns = kwargs.get("geo_columns", [])

    if geo_columns:
        boundary_dict = mix.get_boundary_box(
            dataframe=original_dataframe,
            geo_columns=geo_columns,
        )

        response = {
            "message": "Boundary box generated successfully",
            "boundary_box": boundary_dict,
        }
        return response

    response = {
        "message": "Boundary box not generated, some information was not provided (geography column names).",
        "bounday_box": {},
    }
    return response


def get_temporal_extent(context, filename=None, **kwargs):
    # Setup
    # If no filename is passed in, default to the converted raw_data file.
    if filename is None:
        filename = "raw_data.csv"

    # Always analyze the csv version of the file
    if not filename.endswith(".csv"):
        filename = filename.split(".")[0] + ".csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    file = get_rawfile(rawfile_path)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("time_column", "")

    if time_column:
        temporal_extent = mix.get_temporal_boundary(
            dataframe=original_dataframe, time_column=time_column
        )

        response = {
            "message": "Temporal extent generated successfully",
            "temporal_extent": temporal_extent,
        }
        return response

    response = {
        "message": "Temporal extent not generated, some information was not provided (time column name).",
        "temporal_extent": {},
    }
    return response
