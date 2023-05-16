import requests
from dotenv import load_dotenv
from pathlib import Path

# import pprint
import os
from os.path import join as path_join
import time
import dpath
from datetime import datetime
import csv

load_dotenv()

PROTOCOL = os.getenv('MD_PROTOCOL')
HOST = os.getenv('MD_HOST')
API_ROOT = os.getenv('MD_API_ROOT')

API_BASE_URL = f"{PROTOCOL}://{HOST}/{API_ROOT}" # does not have trailing slash

root_dir = Path(__file__).resolve().parent.parent
output_dir = path_join(root_dir, "output")


def write_dict_list_to_csv(dict_list, filename):
    if len(dict_list) == 0:
        return

    headers = list(dict_list[0].keys())

    with open(path_join(output_dir, filename), 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(dict_list)


def main():
    """
    Fetches datasets from our service and loops through it to check which datasets
    are not registered properly on the third party service. Some hardcoded properties
    that we can change to inputs later (such as count/size of datasets to scan, etc)
    """

    missing_datasets = []

    # if request to external data service somehow returns 4xx, 5xx
    # it doesnt mean the dataset does not exist, but another HTTP error was received
    response_failed_external_count = 0

    print(f"API_BASE_URL: {API_BASE_URL}")

    # Default is size=1000, we can easily change here
    indicators_url = f"{API_BASE_URL}/indicators/latest?size=1000&requestTime=1684253136784"

    session = requests.Session()
    session.auth = (os.getenv("MD_USER"), os.getenv("MD_PASSWORD"))

    response = session.get(indicators_url)

    if response.ok:

        json_body = response.json()

        print(f"Dojo returned {len(json_body)} datasets (includes deprecated).")

        # sort input dataset list by date; API doesnt provide sort param so we do so locally
        sorted_by_most_recent=sorted(json_body, key=lambda x: x["created_at"], reverse=True)

        for idx, dataset in enumerate(sorted_by_most_recent):

            # if idx > 10:
            #     # let's break for now after finding 10, for debugging purposes
            #     print("Found 10, breaking out for now.")
            #     break

            if not dataset.get("deprecated"):
                # print(f"found id: {dataset['id']}")
                print(f"Parsing dataset No. {idx}")

                new_url = f"{os.getenv('MD_EXTERNAL_BASE_URI')}=%7B%22clauses%22:[%7B%22field%22:%22dataId%22,%22operand%22:%22and%22,%22isNot%22:false,%22values%22:[%22{dataset['id']}%22]%7D,%7B%22field%22:%22type%22,%22operand%22:%22and%22,%22isNot%22:false,%22values%22:[%22indicator%22]%7D]%7D&options=%7B%22excludes%22:[%22outputs.ontologies%22,%22qualifier_outputs.ontologies%22,%22ontology_matches%22,%22geography.admin1%22,%22geography.admin2%22,%22geography.admin3%22]%7D"
                external_dataset_response = session.get(new_url)

                # if response is bad, annotate that it failed and skipped
                if not external_dataset_response.ok:
                    print("External dataset request failed. Increasing failed count.")
                    # TODO store which dataset this failed for
                    response_failed_external_count += 1
                    continue

                data_list = external_dataset_response.json()

                if not len(data_list):

                    keys_of_interest = ["id", "name", "maintainer/name", "created_at", "deprecated"]
                    formatted_dataset = {key: dpath.get(dataset,key) for key in keys_of_interest}

                    formatted_date = datetime.fromtimestamp(formatted_dataset["created_at"]/1000)
                    formatted_dataset["created_date"] = str(formatted_date.date())

                    print(f"Found missing dataset: {formatted_dataset['id']}")
                    missing_datasets.append(formatted_dataset)

                # Arbitrary sleep time to not overload any services.
                time.sleep(0.2)
            else:
                print(f"Dataset No. {idx} with id:{dataset['id']} deprecated. Skipping.")

        print("Done parsing datasets.")
        print(f"Third party's service resturn {response_failed_external_count} bad responses and were skipped.")

        print("Saving missing datasets to csv file")
        write_dict_list_to_csv(missing_datasets, "missing_data_full_run_ca.csv")

        return missing_datasets


