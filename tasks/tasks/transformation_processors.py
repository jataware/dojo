import io
import json
import os
import re
import requests

import sys

import pandas as pd
import numpy as np

from utils import job_setup, put_rawfile, persist_untransformed_file, rewrite_file
from elwood import elwood
from settings import settings


# Geo clipping transformation job
def clip_geo(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")
    rows_pre_clip = len(original_dataframe.index)

    # Main Call
    shape_list = kwargs.get("map_shapes", [])
    geo_columns = kwargs.get("geo_columns", {})

    if (
        shape_list
        and geo_columns
        and "lat_column" in geo_columns
        and "lon_column" in geo_columns
    ):
        clipped_df = elwood.clip_geo(
            dataframe=original_dataframe,
            geo_columns=geo_columns,
            polygons_list=shape_list,
        )

        print(f"CLIPPED GEO: {clipped_df}")

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(clipped_df.index)

        preview = kwargs.get("preview_run", False)

        if not preview:
            # If the run is not a preview run, persist the transformation.
            file.seek(0)
            persist_untransformed_file(context["uuid"], filename, file)

            # Put the new clipped file to overwrite the old one.
            file_buffer = io.BytesIO()

            clipped_df.to_csv(file_buffer)
            file_buffer.seek(0)

            put_rawfile(path=rawfile_path, fileobj=file_buffer)

            post_transformation_message(
                context=context,
                prefix="*Clipped",
                message=(
                    f"This data was modified from its original geographic extent, transforming from {rows_pre_clip} "
                    f"entries to {rows_post_clip} entries."
                ),
            )

        response = {
            "messsage": "Geography clipped successfully",
            "preview": json_dataframe_preview,
            "rows_pre_clip": rows_pre_clip,
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
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")
    rows_pre_clip = len(original_dataframe.index)

    # Main Call
    time_column = kwargs.get("datetime_column", "")
    time_ranges = kwargs.get("time_ranges", [])

    if time_column and time_ranges:
        clipped_df = elwood.clip_dataframe_time(
            dataframe=original_dataframe,
            time_column=time_column,
            time_ranges=time_ranges,
        )

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(clipped_df.index)

        preview = kwargs.get("preview_run", False)

        if not preview:
            # If the run is not a preview run, persist the transformation.
            file.seek(0)
            persist_untransformed_file(context["uuid"], filename, file)

            # Put the new clipped file to overwrite the old one.
            file_buffer = io.BytesIO()

            clipped_df.to_csv(file_buffer)
            file_buffer.seek(0)

            put_rawfile(path=rawfile_path, fileobj=file_buffer)

            post_transformation_message(
                context=context,
                prefix="*Extent",
                message=(
                    f"This data was modified from its original temporal extent, transforming from {rows_pre_clip} "
                    f"entries to {rows_post_clip} entries."
                ),
            )

        response = {
            "messsage": "Time clipped successfully",
            "preview": json_dataframe_preview,
            "rows_pre_clip": rows_pre_clip,
            "rows_post_clip": rows_post_clip,
        }
        return response

    response = {
        "message": "Time values not clipped, some information was not provided (time column or time range list).",
        "dataframe": original_dataframe.to_json(),
    }
    return response


# Time rescaling transformation job
def scale_time(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")
    rows_pre_clip = len(original_dataframe.index)

    # Main call
    time_column = kwargs.get("datetime_column", "")
    time_bucket = kwargs.get("datetime_bucket", "")
    aggregation_list = kwargs.get("aggregation_function_list", [])
    geo_columns = kwargs.get("geo_columns", None)

    if time_column and time_bucket and aggregation_list:
        try:
            clipped_df = elwood.rescale_dataframe_time(
                dataframe=original_dataframe,
                time_column=time_column,
                time_bucket=time_bucket,
                aggregation_functions=aggregation_list,
                geo_columns=geo_columns,
            )
        except ValueError as e:
            response = {
                "message": f"Time not rescaled due to error: {str(e)}",
                "dataframe": original_dataframe.to_json(),
            }
            return response

        json_dataframe_preview = clipped_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(clipped_df.index)

        preview = kwargs.get("preview_run", False)

        if not preview:
            # If the run is not a preview run, persist the transformation.
            file.seek(0)
            persist_untransformed_file(context["uuid"], filename, file)

            # Put the new clipped file to overwrite the old one.
            file_buffer = io.BytesIO()

            clipped_df.to_csv(file_buffer)
            file_buffer.seek(0)

            put_rawfile(path=rawfile_path, fileobj=file_buffer)

            post_transformation_message(
                context=context,
                prefix="*Scaled",
                message=(
                    f"This data was rescaled from its original temporal scale, transforming from {rows_pre_clip} "
                    f"entries to {rows_post_clip} entries."
                ),
            )

        response = {
            "messsage": "Time rescaled successfully",
            "preview": json_dataframe_preview,
            "rows_pre_clip": rows_pre_clip,
            "rows_post_clip": rows_post_clip,
        }
        return response

    response = {
        "message": "Time not rescaled, some information was not provided (time column, time bucket, or aggregation function list).",
        "dataframe": original_dataframe.to_json(),
    }
    return response


def regrid_geo(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")
    print(f"starting frame: {original_dataframe}")
    sys.stdout.flush()
    rows_pre_clip = len(original_dataframe.index)

    # Main Call
    geo_column = kwargs.get("geo_columns")
    time_column = kwargs.get("datetime_column")[0]
    scale_multiplier = kwargs.get("scale_multi")
    scale = kwargs.get("scale", None)
    aggregation_functions = kwargs.get("aggregation_function_list")

    if geo_column and time_column and scale_multiplier:
        regridded_df = elwood.regrid_dataframe_geo(
            dataframe=original_dataframe,
            geo_columns=geo_column,
            time_column=time_column,
            scale_multi=scale_multiplier,
            scale=scale,
            aggregation_functions=aggregation_functions,
        )

        json_dataframe_preview = regridded_df.head(100).to_json(default_handler=str)
        rows_post_clip = len(regridded_df.index)

        preview = kwargs.get("preview_run", False)

        if not preview:
            # If the run is not a preview run, persist the transformation.
            file.seek(0)
            persist_untransformed_file(context["uuid"], filename, file)

            # Put the new clipped file to overwrite the old one.
            file_buffer = io.BytesIO()

            regridded_df.to_csv(file_buffer)
            file_buffer.seek(0)

            put_rawfile(path=rawfile_path, fileobj=file_buffer)

            post_transformation_message(
                context=context,
                prefix="*Regridded",
                message=(
                    f"This data was regridded from its original geographical resolution, transforming from {rows_pre_clip} "
                    f"entries to {rows_post_clip} entries."
                ),
            )

        response = {
            "messsage": "Geography rescaled successfully",
            "preview": json_dataframe_preview,
            "rows_pre_clip": rows_pre_clip,
            "rows_post_clip": rows_post_clip,
        }
        return response

    response = {
        "message": "Geography not rescaled, some information was not provided (geo_columns, scale_multiplier).",
        "dataframe": original_dataframe.to_json(),
    }
    return response


def get_boundary_box(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    geo_columns = kwargs.get("geo_columns", {})

    if geo_columns and "lat_column" in geo_columns and "lon_column" in geo_columns:
        boundary_dict = elwood.get_boundary_box(
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
        "boundary_box": {},
    }
    return response


def get_temporal_extent(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("datetime_column", "")

    if time_column:
        temporal_extent = elwood.get_temporal_boundary(
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


def get_unique_dates(context, filename=None, **kwargs):
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("datetime_column", "")

    if time_column:
        unique_dates = original_dataframe[time_column].unique()
        unique_dates = np.sort(unique_dates)

        response = {
            "message": "Unique dates list generated",
            "unique_dates": unique_dates.tolist(),
        }
        return response

    response = {
        "message": "Unique dates list not generated, some information was not provided (time column name).",
        "unique_dates": [],
    }
    return response


def restore_raw_file(context, filename=None, **kwargs):
    if filename is None:
        filename = "raw_data_untransformed.csv"
        target_filename = "raw_data.csv"

    rawfile_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], filename
    )
    restore_path = os.path.join(
        settings.DATASET_STORAGE_BASE_URL, context["uuid"], target_filename
    )

    message, transformed_bool = rewrite_file(rawfile_path, restore_path)

    response = {"message": message, "transformed": transformed_bool}

    return response


def get_dataframe_rows(context, filename=None):
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    file_size = os.fstat(file.fileno()).st_size

    rows_pre_clip = len(original_dataframe.index)

    return {
        "message": "Current rows in the dataset calculated.",
        "dataset_size": file_size,
        "dataset_row": rows_pre_clip,
    }


def post_transformation_message(context, message, prefix):
    # Get original description
    description = context["dataset"]["description"]

    # Look for old transformation message
    # Regex matches an * followed by a prefix and any characters, leading to a period character and a new line.
    prefix_builder = prefix.replace("*", "")
    regex = f"/\*{prefix_builder}.*\.\n/g"

    found = re.search(regex, description)

    if found:
        description = description.replace(found, "")

    # Append message
    transformation_message = f"\n{prefix} {message}\n"
    description += transformation_message

    # Post new description
    uuid = context["uuid"]
    payload = {
        "id": uuid,
        "description": description,
        "name": context["dataset"]["name"],
        "maintainer": context["dataset"]["maintainer"],
    }

    api_url = settings.DOJO_URL
    response = requests.patch(f"{api_url}/indicators?indicator_id={uuid}", json=payload)
    print(f"Description updated: {response.content}")
