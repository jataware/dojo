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


def generate_index_model_weights(
    context, filename=None, on_success_endpoint=None, *args, **kwargs
):

    # Generate Tree and File Retrieval object

    retrieval_dictionary = {}
    tree = None
    payload = kwargs.get("json_payload")
    index_model_object = json.load(payload)
    # print(index_model_object)
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

        if os.path.isfile(f"/code/pca_experiments/datasets/{key}.csv"):
            print(f"dataset file for {key} already downloaded, skipping")
        else:
            # else we download the dataset
            url = (
                api_url + download_endpoint + "indicators/" + key + "?wide_format=true"
            )  # GET NORMALIZED DATA and pivot.
            print(url)
            file_obj = session.get(url)
            # print(file_obj)

            with open(f"/code/pca_experiments/datasets/{key}.csv", "w") as f:
                writer = csv.writer(f)
                for line in file_obj.iter_lines():
                    writer.writerow(line.decode("utf-8").split(","))
                f.close()

            print("Done downloading or checking files.")
        original_dataset = pandas.read_csv(
            f"/code/pca_experiments/datasets/{key}.csv", on_bad_lines="skip"
        )
        print(f"Looking for: {value}")
        target_columns = []
        rename_dict = {}
        for dictionary in value:
            target_columns.append(dictionary["source_column"])
            rename_dict[dictionary["source_column"]] = dictionary["model_name"]
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

        scaled_frame = dataframe.resample("Y", on="timestamp").agg(
            "mean"
        )  # TODO grab agg func from input json.
        scaled_frame.reset_index(inplace=True)
        data_list.append(scaled_frame)

    master_frame = None
    for dataset in data_list:
        if master_frame is None:
            master_frame = dataset
            continue
        master_frame = pandas.merge(master_frame, dataset, on=same_columns, how="outer")
    print(master_frame)
    master_frame.to_csv("/code/pca_experiments/ND_gain_synthetic_model.csv")

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

    # DO WEIGHT CALCULATIONS

    weighted_sums = {}
    for pc_index, principle_component in enumerate(pca_components_list):
        # [0.####, 0.##### ...]
        for feature_index, value in enumerate(principle_component):
            weighted_sums[feature_index] = weighted_sums.get(feature_index, 0) + (
                value * pca.explained_variance_ratio_[pc_index]
            )
    print(weighted_sums)

    total_sums = 0
    for key, value in weighted_sums.items():
        total_sums += value

    result_percent = {}
    for key, value in weighted_sums.items():
        result_percent[key] = value / total_sums

    print(result_percent)

    result_leaf_weights = {}
    for key, value in result_percent.items():
        feature_name = master_frame.columns[key]
        if value is None or value == 0:
            print(f"-> None or 0 value: {feature_name} {value}")
        if result_leaf_weights.get(feature_name, None):
            print(f"-> Same Key: {feature_name} {value}")
        result_leaf_weights[feature_name] = value
        feature_percent = round(value * 100, 2)
        print(f"{feature_name}: {feature_percent} %")

    # SOLVE TREE WITH WEIGHTS

    update_leaf_weights(result_leaf_weights, tree)
    compute_weights(tree)
    compute_edge_percent(tree)


# TODO REMOVE
api_url = "http://causemos-analyst.dojo-modeling.com/api/dojo/dojo/"
download_endpoint = "download/csv/"
indicator_endpoint = "indicators/"


# FEATURE + DATASET LIST GENERATION

found_values = {}
# Takes the ND_gain.json model and finds all datasets we need to download.
# Creates a structure of:
# {<dataset id in dojo>: [{"source_column": <dataset column name>, "model_name": <name of component in index model>}]}
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
                                    "model_name": val.get("name"),
                                }
                            )
                        else:
                            found_values[data_id] = [
                                {
                                    "source_column": val.get("outputVariable"),
                                    "model_name": val.get("name"),
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
    def __init__(self, output_variable, children=[], parent=None):
        self.output_variable = output_variable
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
        return f"{self.output_variable}, {self.children}, {self.weight}"


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
        if node.output_variable in leaf_weights:
            node.weight = leaf_weights[node.output_variable]


def sum_of_leaves(node):  # Sums all leaves under a node to get a node's weight
    total_weight = 0
    if not node.children:
        #         print(f"{node.output_variable} : {node.weight}")
        total_weight += node.weight
    else:
        for child in node.children:
            total_weight += sum_of_leaves(child)
    return total_weight


def compute_weights(node):  # Computes a weight for a node and assigns it
    node.weight = sum_of_leaves(node)
    for child in node.children:
        compute_weights(child)


def compute_edge_percent(  # TODO this returns all the final percents in the tree.
    node,
):  # Computes the edge percentage for a node to it's parent and stores it.
    if node.parent:
        parent_name = node.parent.output_variable
        node_weight = node.weight
        parent_weight = node.parent.weight
        if parent_weight != 0:
            node.edges[parent_name] = round(node_weight / parent_weight * 100, 2)
        else:
            node.edges[parent_name] = 0
    for child in node.children:
        compute_edge_percent(child)


# def print_tree(node, indent=""):
#     print(indent + f"{node.output_variable}: Weight: {node.weight}, Edges: {node.edges}")
#     for child in node.children:
#         print_tree(child, indent + "   ")


def print_tree(node, indent=""):
    if indent:
        last_char = indent[-1]
        indent = indent[:-1] + "│ " if last_char == "├" else indent[:-1] + " "

    print(f"{indent}{node.output_variable}, Edges: {node.edges}")

    if node.children:
        for i, child in enumerate(node.children):
            if i == len(node.children) - 1:
                print_tree(child, indent + "└── ")
            else:
                print_tree(child, indent + "├── ")
