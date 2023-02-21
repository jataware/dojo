import io
import json
import os

import pandas as pd

from utils import job_setup, put_rawfile
from elwood import elwood
from settings import settings


# Geo clipping transformation job
def clip_geo(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    shape_list = kwargs.get("map_shapes", [])
    geo_columns = kwargs.get("geo_columns", [])

    if shape_list and geo_columns:
        clipped_df = elwood.clip_data(
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
            filename.split(".")[0] + "_untransformed.csv",
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
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    time_column = kwargs.get("time_column", "")
    time_ranges = kwargs.get("time_ranges", [])

    if time_column and time_ranges:
        clipped_df = elwood.clip_dataframe_time(
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
            filename.split(".")[0] + "_untransformed.csv",
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
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("time_column", "")
    time_bucket = kwargs.get("time_bucket", "")
    aggregation_list = kwargs.get("aggregation_function_list", [])

    if time_column and time_bucket and aggregation_list:
        clipped_df = elwood.rescale_dataframe_time(
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
            filename.split(".")[0] + "_untransformed.csv",
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


def regrid_geo(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    geo_column = kwargs.get("geo_columns")
    scale_multiplier = kwargs.get("scale_multi")

    if geo_column and scale_multiplier:
        regridded_df = elwood.regrid_dataframe_geo(
            dataframe=original_dataframe,
            geo_column=geo_column,
            scale_multi=scale_multiplier,
        )

        json_dataframe_preview = regridded_df.head(100).to_json(default_handler=str)

        # Make a filepath to persist the original file.
        original_file_path = os.path.join(
            settings.DATASET_STORAGE_BASE_URL,
            context["uuid"],
            filename.split(".")[0] + "_untransformed.csv",
        )
        put_rawfile(original_file_path, file)

        # Put the new clipped file to overwrite the old one.
        file_buffer = io.BytesIO()

        regridded_df.to_csv(file_buffer)
        file_buffer.seek(0)

        put_rawfile(path=rawfile_path, fileobj=file_buffer)

        response = {
            "messsage": "Geography rescaled successfully",
            "preview": json_dataframe_preview,
        }
        return response

    response = {
        "message": "Geography not rescaled, some information was not provided (geo_columns, scale_multiplier).",
        "dataframe": json.loads(json.dumps(original_dataframe)),
    }
    return response


def get_boundary_box(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main Call
    geo_columns = kwargs.get("geo_columns", [])

    if geo_columns:
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
        "bounday_box": {},
    }
    return response


def get_temporal_extent(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    original_dataframe = pd.read_csv(file, delimiter=",")

    # Main call
    time_column = kwargs.get("time_column", "")

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