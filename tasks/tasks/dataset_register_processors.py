import json
import logging
import requests
import os

from file_processors import file_conversion
from elwood_processors import run_elwood, scale_features

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)


def finish_dataset_registration(context, filename=None, **kwargs):
    """
    At this point the following are true:
    1. A dataset has been created
    2. Annotations, metadata for dataset have been stored
    3. The raw file has been uploaded to S3/minio

    The following needs to occur here:
    1. Convert file to CSV, if source data isn't a CSV file already
    1.b Upload the raw_data.csv file if we converted from another format
    2. Run elwood on the dataset
    3. Scale features on the dataset
    4. Update stores dataset
    5. Publish final dataset
    """

    uuid = context["uuid"]

    logging.info(f"Called finish_dataset_registration, ID: {uuid}, filename: {filename}")

    if not context["annotations"]["metadata"]["files"][filename]["filetype"] == "csv":
        logging.info("Transforming non-csv file to csv.")
        s3_csv_file_path = file_conversion(context, filename)

    # TODO should we call geotime classify?

    # TODO 1.5 Apply any data transformations from annotations.metadata(LATER)
    # Eg clipping shapes, gadm overrides, force-adjust resolution, etc

    elwood_response = run_elwood(context, filename)

    DOJO_URL = os.environ.get("DOJO_URL")

    update_body = {
        **elwood_response,
        "data_paths": elwood_response["data_files"],
    }
    del update_body["data_files"]
    del update_body["preview"]

    updated_dataset = {**context["dataset"], **update_body}

    new_context = {
        **context,
        "dataset": updated_dataset
    }

    scale_response = scale_features(new_context)

    updated_dataset = {
        **updated_dataset,
        **scale_response
    }

    update_url = f"{DOJO_URL}/indicators/"

    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    update_response = requests.put(update_url, json=updated_dataset, headers=headers)

    publish_url = f"{DOJO_URL}/indicators/{uuid}/publish"
    publish_response = requests.put(publish_url)

    if update_response.ok and publish_response.ok:
        updated_dataset["published"] = True

    return updated_dataset
