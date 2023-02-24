import json

from cartwright.analysis.time_resolution import (
    convert_to_timestamps,
    detect_temporal_resolution,
)
from cartwright.analysis.space_resolution import detect_latlon_resolution
import pandas as pd

from utils import job_setup


def calculate_temporal_resolution(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    dataframe = pd.read_csv(file, delimiter=",")

    datetime_column = kwargs.get("datetime_column")
    time_format = kwargs.get("time_format")

    timestamps = convert_to_timestamps(
        dataframe[datetime_column].to_list(), time_format
    )

    resolution = detect_temporal_resolution(timestamps)

    response = {
        "message": "Resolution calculated successfully",
        "resolution_result": {
            "uniformity": resolution.uniformity.name,
            "unit": resolution.unit.name,
            "resolution": resolution.resolution,
            "error": resolution.error,
        },
    }

    print(response)

    return response


def calculate_geographical_resolution(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    dataframe = pd.read_csv(file, delimiter=",")

    latitude = kwargs.get("lat_column")
    longitude = kwargs.get("lon_column")

    lat = dataframe[latitude].to_numpy()
    lon = dataframe[longitude].to_numpy()

    resolution = detect_latlon_resolution(lat, lon)

    print(f"RESOLUTION: {resolution}")

    if resolution is None or resolution.square is None:
        response = {
            "message": "Resolution not detectable",
            "resolution_result": "None",
        }
        return response

    response = {
        "message": "Resolution calculated successfully",
        "resolution_result": {
            "uniformity": resolution.square.uniformity.name,
            "unit": resolution.unit.square.name,
            "resolution": resolution.square.resolution,
            "error": resolution.square.error,
        },
    }

    return response
