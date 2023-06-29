import json

from cartwright.analysis.time_resolution import (
    convert_to_timestamps,
    detect_temporal_resolution,
)
from cartwright.analysis.space_resolution import detect_latlon_resolution
import pandas as pd

from utils import job_setup

temporal_resolutions = ["L", "S", "T", "H", "D", "W" "M", "Q", "Y"]


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

    if resolution is None:
        response = {
            "message": "Resolution not detectable",
            "resolution_result": "None",
        }
        return response

    response = {
        "message": "Resolution calculated successfully",
        "resolution_result": {
            "uniformity": resolution.uniformity.name,
            "unit": resolution.unit.name,
            "resolution": resolution.resolution,
            "error": resolution.error,
        },
    }

    return response


def calculate_geographical_resolution(context, filename=None, **kwargs):
    # Setup
    file, filename, rawfile_path = job_setup(context=context, filename=filename)
    dataframe = pd.read_csv(file, delimiter=",")

    latitude = kwargs.get("lat_column")
    longitude = kwargs.get("lon_column")

    lat = dataframe[latitude].to_numpy()
    lon = dataframe[longitude].to_numpy()

    resolution_res = detect_latlon_resolution(lat, lon)

    if resolution_res is None or resolution_res.square is None:
        response = {
            "message": "Resolution not detectable",
            "resolution_result": "None",
        }
        return response

    try:

        scale_km = degrees_to_km(
            resolution_res.square.unit.name, resolution_res.square.resolution
        )
        sample_geo_scale_km = [scale_km * multiplier for multiplier in range(1, 21)]
        scale_deg = resolution_res.square.resolution
        sample_geo_scale_deg = [scale_deg * multiplier for multiplier in range(1, 21)]
        response = {
            "message": "Resolution calculated successfully",
            "resolution_result": {
                "uniformity": resolution_res.square.uniformity.name,
                "unit": resolution_res.square.unit.name,
                "resolution": resolution_res.square.resolution,
                "error": resolution_res.square.error,
            },
            "scale_km": scale_km,
            "multiplier_samples_km": sample_geo_scale_km,
            "scale_deg": scale_deg,
            "multiplier_samples_deg": sample_geo_scale_deg,
        }

        return response
    except TypeError as error:
        response = {
            "message": f"Error calculating geographical resolution: {error}",
            "resolution_result": "None",
        }
        return response


def degrees_to_km(degree_unit, value):

    value = float(value)

    if degree_unit == "degrees":
        return value * float(111)
    if degree_unit == "minutes":
        return value * float(111 / 60)
    if degree_unit == "seconds":
        return value * ((111 / 60) / 60)
