import json
import requests
import tempfile
import sys
import os
import csv

from io import BytesIO

from datetime import datetime
import warnings

import pandas
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import numpy
import logging
from pathlib import Path
from os.path import join as path_join
from functools import partial

from typing import Dict, List, Tuple

# TODO check which are ignorable and which are true
# warnings.filterwarnings('ignore')

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)

api_url = os.environ.get("DOJO_HOST")
download_endpoint = "/dojo/download/csv/"
indicator_endpoint = "/indicators/"

root_dir = Path(__file__).resolve().parent.parent
test_data_dir = path_join(root_dir, "test_data")
datasets_cache_dir = path_join(test_data_dir, "datasets")


"""
Definitions:

1. synthetic dataset:
     Dataset built by merging select individual features/columns/
     variables from every dataset refered to in the input index.
     Originally defined as master_frame.

2. pca-to-weight:
     The idea of using PCA's output to derive some weight percentages that
     describe the patterns on the features within the synthetic frame.

"""


roundToThree = partial(round, ndigits=3)


def calc_percents(numbers_list):
    total = sum(numbers_list)

    percents = []
    for value in numbers_list:
        percents.append(value / total)

    return percents


def download_datasets(index_datasets_features: Dict) -> List[str]:
    """
    """

    WM_USER = os.getenv("WM_USER", "whitehat")
    WM_PASS = os.getenv("WM_PASS", "password123wink")

    session = requests.Session()
    session.auth = (WM_USER, WM_PASS)

    for key, value in index_datasets_features.items():
        if not os.path.exists(datasets_cache_dir):
            os.makedirs(datasets_cache_dir)

        if os.path.isfile(f"{datasets_cache_dir}/{key}.csv"):
            logging.info(f"Dataset file for {key} already downloaded, skipping.")
        else:
            # else we download the dataset
            url = (
                api_url + download_endpoint + "indicators/" + key + "?wide_format=true"
            )  # GET NORMALIZED DATA and pivot.
            logging.info(url)
            file_obj = session.get(url)

            with open(f"{datasets_cache_dir}/{key}.csv", "w") as f:
                writer = csv.writer(f)
                for line in file_obj.iter_lines():
                    writer.writerow(line.decode("utf-8").split(","))
                f.close()

            logging.info("Done downloading or checking files.")

    return index_datasets_features.keys()


SHARED_COLUMNS = ["timestamp", "country"]


def save_synthetic_dataset(dataframe: pandas.DataFrame, file_prefix: str = "synthetic_dataframe"):
    """
    Optional tool for debugging purposes
    """
    now = datetime.now()
    date_time = now.strftime("%d-%m-%Y_%H-%M-%S")

    dataframe.to_csv(path_join(test_data_dir, f"{file_prefix}_{date_time}.csv"))


def build_synthetic_dataset(dataset_ids: List, index_datasets_features: Dict) -> pandas.DataFrame:
    """
    Use all downloaded datasets and build a synthetic dataset without filling
    NaNs nor removing extranous columns

    TODO instead of creating an intermediary data_list and then merging,
    create the synthetic frame directly
    """

    same_columns = SHARED_COLUMNS
    geo_columns = ["country"]
    data_list = []

    for dataset_id in dataset_ids:
        original_dataset = pandas.read_csv(
            f"{datasets_cache_dir}/{dataset_id}.csv",
            on_bad_lines="skip",
            low_memory=False
        )

        # Use info extracted from model to get info out of the dataset.
        target_columns = []
        rename_dict = {}
        aggregation = ""

        features_in_dataset = index_datasets_features[dataset_id]

        for features_dict in features_in_dataset:
            target_columns.append(features_dict["source_column"])
            rename_dict[features_dict["source_column"]] = features_dict["name_in_model"]
            aggregation = features_dict["aggregation"]

        relevant_data = original_dataset[["timestamp", "country", *target_columns]]

        relevant_data["timestamp"] = pandas.to_datetime(
            relevant_data["timestamp"], unit="ms"
        )

        relevant_data.rename(columns=rename_dict, inplace=True)

        dataframe = relevant_data.set_index(geo_columns)
        dataframe = dataframe.groupby(geo_columns)

        scaled_frame = dataframe.resample("Y", on="timestamp").agg(aggregation)
        scaled_frame.reset_index(inplace=True)
        data_list.append(scaled_frame)

    synthetic_dataset = None
    for dataset in data_list:
        if synthetic_dataset is None:
            synthetic_dataset = dataset
            continue
        synthetic_dataset = pandas.merge(synthetic_dataset, dataset, on=same_columns, how="outer")

    return synthetic_dataset



def normalize_synthetic_dataset(synthetic_dataset: pandas.DataFrame) -> pandas.core.frame.DataFrame:
    """
    Should receive raw synthetic dataset and fill NaNs and remove columns
    not relevant to our analysis
    """
    columns_to_remove = SHARED_COLUMNS + [ '0', 'Unnamed: 0']

    normalized_synthetic_dataset = synthetic_dataset.copy()

    for item in columns_to_remove:
        if item in list(synthetic_dataset.columns):
            normalized_synthetic_dataset = normalized_synthetic_dataset.drop(columns=[item])

    normalized_synthetic_dataset.fillna(normalized_synthetic_dataset.mean(), inplace=True)

    return normalized_synthetic_dataset


def perform_pca(synthetic_dataset: pandas.DataFrame) -> Tuple:
    # Standardize the data
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(synthetic_dataset)

    # Perform PCA
    pca = PCA()
    pca.fit(scaled_data)

    pca_components_list = abs(pca.components_)
    pca_components_count = pca.n_components_
    pca_explained_ratios = pca.explained_variance_ratio_

    return (pca_components_list, pca_components_count, pca_explained_ratios)


def pca_to_weights_v1(pca_details: Tuple) -> List[float]:
    """
    Original pca-to-weights algorithm
    """

    (pca_components_list, pca_components_count, pca_explained_ratios) = pca_details

    weighted_sums = {}
    for pc_index, principle_component in enumerate(pca_components_list):
        for feature_index, value in enumerate(principle_component):
            weighted_sums[feature_index] = weighted_sums.get(feature_index, 0) + (
                value * pca_explained_ratios[pc_index]
            )

    total_sums = 0
    for key, value in weighted_sums.items():
        total_sums += value

    result_percent = {}
    for key, value in weighted_sums.items():
        result_percent[key] = value / total_sums

    return result_percent.values()


# FOr v2 maybe later:
# Option A Impl: TODO
    # def calc_highest_ratios_4pc_ea(explained_variance_ratios: List):
    #     pass

    # # Option B Impl: TODO
    # def calc_highest_ratios_90pc_total(explained_variance_ratios: List):
    #     pass


def pca_to_weights_v2(pca_details: Tuple):
    """
    Joel's Average pca-weights-algorithm
    as described in doc: `PCA: Feature Contributions Using Control Dataset`

    This is using a Option A above (filters out any PC with explained variance less than 4%)
    which has disadvantages under even-PC-explained-variance scenarios

    Option B would use the same approach as what v3 uses, but has not been implemented here.
    """
    (pca_components_list, pca_components_count, pca_explained_ratios) = pca_details

    highest_variance_ratios = list(filter(lambda x: x > 0.04, map(roundToThree, pca_explained_ratios)))
    weight_matrix = [[0] * pca_components_count for i in range(0, len(highest_variance_ratios))]
    amount_relevant = len(highest_variance_ratios)

    for pc_index, principle_component in enumerate(pca_components_list):
        for feature_index, value in enumerate(principle_component):
            relative_value = value * pca_explained_ratios[pc_index]

            if pc_index < amount_relevant:
                weights_row = weight_matrix[pc_index]
                weights_row[feature_index] = weights_row[feature_index] + relative_value

    matrix_percents = list(map(calc_percents, weight_matrix))
    matrix_averages = [(sum(v)/amount_relevant) for i, v in enumerate(zip(*matrix_percents))]

    return matrix_averages


def pca_to_weights_v3(pca_details: Tuple, target_pca_explained_sum=0.7):
    """
    Third version (mix of v1 and v2) with some changes.
    """

    (pca_components_list, pca_components_count, pca_explained_ratios) = pca_details

    if type(pca_components_list) == list:
        pca_components_list = numpy.array(pca_components_list)

    # Target sum of variance explained by PCA
    # The closer this is to 1, the more PCs required
    # E.g. target_sum = 1; n_PCs = n_Features
    target_sum = target_pca_explained_sum    # eg 70% , TODO make an endpoint argument
    cumulative_sum = numpy.cumsum(pca_explained_ratios)  # Calculate the cumulative sum

    # Find the index where the cumulative sum exceeds or reaches the target sum
    index = numpy.argmax(cumulative_sum >= target_sum)

    # Calculate the number of items needed to reach the target sum
    items_needed = index + 1

    logging.info(f"Using this target cumumative explained variance across relevant PCs: {target_pca_explained_sum * 100}%")
    logging.info(f"Using {items_needed} PCs out of a total of {pca_components_count}")

    # absolute value feature contributions to each PC
    # transpose to get one feature per row
    # eg. row 1 has contributions of feature 1 to the n selected PCs
    arr_2d = numpy.abs(pca_components_list.T[:,:items_needed])

    # weight by variance in data explained by each PC
    # e.g. PC_1 is "worth more"
    weighted = arr_2d * pca_explained_ratios[:items_needed]

    # Sum the contribution of each feature to each of the selected PCs
    results = weighted.sum(axis=1)

    # Rescale results to sum to 1
    results_scaled = results / numpy.sum(results)

    return results_scaled


def build_final_hierarchy_weights(
        dataframe_columns: List[str], flat_feature_weights: List[float], tree
):

    result_leaf_weights = {}

    logging.info(" --- ")

    for index, value in enumerate(flat_feature_weights):
        feature_name = dataframe_columns[index]
        result_leaf_weights[feature_name] = value
        feature_percent = round(value * 100, 3)
        logging.info(f"{feature_name}: {feature_percent} %")

    # SOLVE TREE WITH WEIGHTS
    update_leaf_weights(result_leaf_weights, tree)
    compute_weights(tree)
    compute_edge_percent(tree)

    # GENERATE THE PAYLOAD UNCHARTED EXPECTS
    output = generate_output_payload(tree)

    response = {"final_percentages": output}

    return response


def generate_index_model_weights(
    context={}, filename=None, on_success_endpoint=None, *args, **kwargs
):

    retrieval_dictionary = {}
    tree = None
    payload = kwargs.get("json_payload")
    index_model_object = json.loads(json.dumps(payload))

    index_datasets_features = iteration_func(index_model_object)

    logging.info(" -> Downloading datasets")
    dataset_ids = download_datasets(index_datasets_features)

    logging.info(" --- ")

    logging.info(" -> Creating synthetic dataset")
    synthetic_dataset = build_synthetic_dataset(dataset_ids, index_datasets_features)

    normalized_synthetic_dataset = normalize_synthetic_dataset(synthetic_dataset)

    columns = list(normalized_synthetic_dataset.columns)

    logging.info(" -> Applying PCA")
    pca_tuple_outputs = perform_pca(normalized_synthetic_dataset)

    logging.info(" -> PCA-to-Weights algorithm v3 running")
    weights = pca_to_weights_v3(pca_tuple_outputs, target_pca_explained_sum=0.7)

    logging.info(" -> Building tree")
    tree = build_tree(index_model_object["state"]["index"])

    logging.info(" -> Building final hierarchical weights for tree")
    index_component_weights_out = build_final_hierarchy_weights(columns, weights, tree)

    return index_component_weights_out




# FEATURE + DATASET LIST GENERATION


def iteration_func(data):
    found_values = {}

    iteration_func_helper(data, found_values)

    return found_values


# Takes the ND_gain.json model and finds all datasets we need to download.
# Creates a structure of:
# {<dataset id in dojo>: [{"source_column": <dataset column name>, "name_in_model": <name of component in index model>}]}
def iteration_func_helper(data, accumulator):

    for key, value in data.items():
        if type(value) == type(dict()):
            iteration_func_helper(value, accumulator)
        elif type(value) == type(list()):
            if key == "inputs":
                for val in value:
                    data_id = val.get("datasetId", None)
                    if data_id is not None:
                        if accumulator.get(data_id, None):
                            accumulator.get(data_id).append(
                                {
                                    "source_column": val.get("outputVariable"),
                                    "name_in_model": val.get("name"),
                                    "aggregation": val.get("temporalAggregation"),
                                }
                            )
                        else:
                            accumulator[data_id] = [
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
                    iteration_func_helper(val, accumulator)

    return accumulator


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

    import pprint
    pp = pprint.PrettyPrinter(indent=2)

    sample_ND_JSON_PATH = path_join(test_data_dir, 'ND-GAIN.json')

    with open(sample_ND_JSON_PATH) as file:
        index_model_object = json.load(file)

    out = generate_index_model_weights(json_payload=index_model_object)

    pp.pprint(f"-->>Out Model weights:\n\n{out}")
