import json
import requests
import tempfile
import sys
import os
import csv

from io import BytesIO

import pandas
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy
import logging
from pathlib import Path
import pprint
from os.path import join as path_join
from functools import partial, reduce

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

api_url = os.environ.get("DOJO_HOST")
download_endpoint = "/dojo/download/csv/"
indicator_endpoint = "/indicators/"

root_dir = Path(__file__).resolve().parent.parent
test_data_dir = path_join(root_dir, "test-data")
datasets_cache_dir = path_join(test_data_dir, "datasets")


roundToTwo = partial(round, ndigits=3)


def calc_percents(numbers_list):
    total = sum(numbers_list)
    # print(f"sum of all numbers in list: {total}")

    percents = []
    for value in numbers_list:
        percents.append(value / total)

    return percents


def generate_index_model_weights(
    context={}, filename=None, on_success_endpoint=None, *args, **kwargs
):

    logging.info("generate index model weights called.")

    # Generate Tree and File Retrieval object

    retrieval_dictionary = {}
    tree = None
    payload = kwargs.get("json_payload")
    index_model_object = json.loads(json.dumps(payload))

    logging.debug(f"index_model_object: {index_model_object}")

    retrieval_dictionary = iteration_func(index_model_object)
    tree = build_tree(index_model_object["state"]["index"])

    # Grab all the files and generate synthetic dataset.

    data_list = []
    same_columns = ["timestamp", "country"]
    geo_columns = ["country"]

    WM_USER = os.getenv("WM_USER")
    WM_PASS = os.getenv("WM_PASS")

    session = requests.Session()
    session.auth = (WM_USER, WM_PASS)

    for key, value in retrieval_dictionary.items():
        if not os.path.exists(datasets_cache_dir):
            os.makedirs(datasets_cache_dir)
        if os.path.isfile(f"{datasets_cache_dir}/{key}.csv"):
            logging.info(f"Dataset file for {key} already downloaded, skipping.")
        else:
            # else we download the dataset
            url = (
                api_url + download_endpoint + "indicators/" + key + "?wide_format=true"
            )  # GET NORMALIZED DATA and pivot.
            print(url)
            file_obj = session.get(url)

            with open(f"{datasets_cache_dir}/{key}.csv", "w") as f:
                writer = csv.writer(f)
                for line in file_obj.iter_lines():
                    writer.writerow(line.decode("utf-8").split(","))
                f.close()

            logging.info("Done downloading or checking files.")
        original_dataset = pandas.read_csv(
            f"{datasets_cache_dir}/{key}.csv", on_bad_lines="skip"
        )

        logging.debug(f"Looking for: {value}")

        # Use info extracted from model to get info out of the dataset.
        target_columns = []
        rename_dict = {}
        aggregation = ""
        for dictionary in value:
            target_columns.append(dictionary["source_column"])
            rename_dict[dictionary["source_column"]] = dictionary["name_in_model"]
            aggregation = dictionary["aggregation"]
        relevant_data = original_dataset[["timestamp", "country", *target_columns]]

        #     for v in value: CHECK APPLY MAP FOR HERE (but also we will have outlier robust in the future precomputed)
        #         relevant_data[v] = numpy.log(relevant_data[v].values)

        # print(relevant_data.shape()[0]) #CHECK SHAPES FOR LENGTH

        relevant_data["timestamp"] = pandas.to_datetime(
            relevant_data["timestamp"], unit="ms"
        )

        relevant_data.rename(columns=rename_dict, inplace=True)

        dataframe = relevant_data.set_index(geo_columns)

        dataframe = dataframe.groupby(geo_columns)

        scaled_frame = dataframe.resample("Y", on="timestamp").agg(aggregation)
        scaled_frame.reset_index(inplace=True)
        data_list.append(scaled_frame)

    master_frame = None
    for dataset in data_list:
        if master_frame is None:
            master_frame = dataset
            continue
        master_frame = pandas.merge(master_frame, dataset, on=same_columns, how="outer")

    # RUN PCA

    same_columns = ["timestamp", "country"]
    master_frame = master_frame.drop(columns=same_columns)

    # Handle missing values
    master_frame.fillna(master_frame.mean(), inplace=True)

    # Standardize the data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(master_frame)

    # Perform PCA
    pca = PCA()
    pca.fit(scaled_data)

    pca_components_list = abs(pca.components_)


###############################################################################
#                   !! START PCA_WEIGHT CALCULATIONS !!
###############################################################################

    logging.debug(f">> Number of PCA components: {pca.n_components_}")

    highest_variance_ratios = list(filter(lambda x: x > 0.04, map(roundToTwo, pca.explained_variance_ratio_)))
    weight_matrix = [[0] * pca.n_components_ for i in range(0, len(highest_variance_ratios))]

    for pc_index, principle_component in enumerate(pca_components_list):
        for feature_index, value in enumerate(principle_component):
            relative_value = value * pca.explained_variance_ratio_[pc_index]

            if pc_index < len(highest_variance_ratios):
                weights_row = weight_matrix[pc_index]
                weights_row[feature_index] = weights_row[feature_index] + relative_value

    logging.info("\n\nWeighted Matrix for relevant PCs:")
    logging.info(weight_matrix)

    matrix_percents = list(map(calc_percents, weight_matrix))
    logging.info(f"Matrix percents:\n{matrix_percents}")

    amount_relevant = len(highest_variance_ratios)
    matrix_averages = [round((sum(v)/amount_relevant)*100, 2) for i, v in enumerate(zip(*matrix_percents))]

    logging.info(f"Final Matrix Averages: {matrix_averages}")

###############################################################################
#                   !! END PCA_WEIGHT CALCULATIONS !!
###############################################################################


    result_leaf_weights = {}
    for index, val in enumerate(matrix_averages):
        value = val / 100
        feature_name = master_frame.columns[index]
        result_leaf_weights[feature_name] = value
        feature_percent = round(value * 100, 2)
        logging.info(f"{feature_name}: {feature_percent} %")

    # SOLVE TREE WITH WEIGHTS

    update_leaf_weights(result_leaf_weights, tree)
    compute_weights(tree)
    compute_edge_percent(tree)

    # GENERATE THE PAYLOAD UNCHARTED EXPECTS

    output = generate_output_payload(tree)
    # print(output)

    response = {"final_percentages": output}

    return response


# FEATURE + DATASET LIST GENERATION

found_values = {}


# Takes the ND_gain.json model and finds all datasets we need to download.
# Creates a structure of:
# {<dataset id in dojo>: [{"source_column": <dataset column name>, "name_in_model": <name of component in index model>}]}
def iteration_func(data):
    for key, value in data.items():
        if type(value) == type(dict()):
            iteration_func(value)
        elif type(value) == type(list()):
            if key == "inputs":
                for val in value:
                    data_id = val.get("datasetId", None)
                    if data_id is not None:
                        if found_values.get(data_id, None):
                            found_values.get(data_id).append(
                                {
                                    "source_column": val.get("outputVariable"),
                                    "name_in_model": val.get("name"),
                                    "aggregation": val.get("temporalAggregation"),
                                }
                            )
                        else:
                            found_values[data_id] = [
                                {
                                    "source_column": val.get("outputVariable"),
                                    "name_in_model": val.get("name"),
                                    "aggregation": val.get("temporalAggregation"),
                                }
                            ]
                    else:
                        pass
            for val in value:
                if type(val) == type(str()):
                    pass
                elif type(val) == type(list()):
                    pass
                else:
                    iteration_func(val)
    return found_values


# INDEX MODEL TREE TRAVERSAL


class Node:  # Node class for the tree.
    def __init__(self, name, children=[], parent=None):
        self.name = name
        self.children = children
        self.parent = parent
        self.weight = 0
        self.edges = {}

    def add_child(self, child):
        self.children.append(child)
        child.parent = self

    def get_ancestors(self):
        ancestors = []
        current = self.parent
        while current:
            ancestors.append(current)
            current = current.parent
        return ancestors

    def __str__(self):
        return f"{self.name}, {self.children}, {self.weight}"


def build_tree(node, parent=None):  # Builds the tree object.
    children = []
    myself = Node(node["name"], children, parent=parent)
    if node.get("inputs", None):
        for child_node in node["inputs"]:
            child = build_tree(child_node, parent=myself)
            children.append(child)
    return myself


def update_leaf_weights(
    leaf_weights, node
):  # Updates the leaf nodes with their weights from PCA.
    if node.children:
        for child in node.children:
            update_leaf_weights(leaf_weights, child)
    else:
        if node.name in leaf_weights:
            node.weight = leaf_weights[node.name]


def sum_of_leaves(node):  # Sums all leaves under a node to get a node's weight
    total_weight = 0
    if not node.children:
        #         print(f"{node.name} : {node.weight}")
        total_weight += node.weight
    else:
        for child in node.children:
            total_weight += sum_of_leaves(child)
    return total_weight


def compute_weights(node):  # Computes a weight for a node and assigns it
    node.weight = sum_of_leaves(node)
    for child in node.children:
        compute_weights(child)


def compute_edge_percent(
    node,
):  # Computes the edge percentage for a node to it's parent and stores it.
    if node.parent:
        parent_name = node.parent.name
        node_weight = node.weight
        parent_weight = node.parent.weight
        if parent_weight != 0:
            node.edges[parent_name] = round(node_weight / parent_weight * 100, 2)
        else:
            node.edges[parent_name] = 0
    for child in node.children:
        compute_edge_percent(child)


def generate_output_payload(node):
    output_payload = {}

    def cycle_tree(tree_node):
        if tree_node.parent:
            output_payload[tree_node.name] = next(iter(tree_node.edges.values()))
        for child in tree_node.children:
            cycle_tree(child)

    cycle_tree(node)

    return output_payload


if __name__ == '__main__':

    sample_ND_JSON_PATH = path_join(test_data_dir, 'ND-GAIN.json')

    with open(sample_ND_JSON_PATH) as file:
        index_model_object = json.load(file)

    out = generate_index_model_weights(json_payload=index_model_object)

    print(f"-->>Out Model weights:\n\n{out}")
