from cartwright.analysis.time_resolution import (
    convert_to_timestamps,
    detect_temporal_resolution,
)
from cartwright.analysis.space_resolution import detect_latlon_resolution
import pandas as pd

from utils import job_setup


def calculate_temporal_resolution(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    dataframe = pd.read_csv(file, delimiter=",")

    datetime_column = kwargs.get("datetime_column")
    time_format = kwargs.get("time_format")

    timestamps = convert_to_timestamps(
        dataframe[datetime_column].to_list(), time_format
    )

    resolution = detect_temporal_resolution(timestamps)

    response = {
        "messsage": "Resolution calculated successfully",
        "resolution_result": {
            "uniformity": resolution.uniformity,
            "unit": resolution.unit,
            "resolution": resolution.resolution,
            "error": resolution.error,
        },
    }

    print(response)

    return response


def calculate_geographical_resolution(context, filename=None, **kwargs):
    # Setup
    file, rawfile_path = job_setup(context=context, filename=filename)
    dataframe = pd.read_csv(file, delimiter=",")

    latitude = kwargs.get("lat_column")
    longitude = kwargs.get("lon_column")

    lat = dataframe[latitude].to_numpy()
    lon = dataframe[longitude].to_numpy()

    resolution = detect_latlon_resolution(lat, lon)

    response = {
        "messsage": "Resolution calculated successfully",
        "resolution_result": resolution,
    }

    return response
