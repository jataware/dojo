import json

import pprint
from pathlib import Path
from os.path import join as path_join
import pytest
import numpy
import pandas

from functools import partial, reduce

import warnings
from typing import Dict, List, Tuple

from tasks.causemos_processors import (
    build_synthetic_dataset,
    # normalize_synthetic_dataset,
    perform_pca,
    pca_to_weights_v3,
    # pca_to_weights_v2,
    iteration_func,
    # build_tree,
    download_datasets
)

warnings.filterwarnings('ignore')
pp = pprint.PrettyPrinter(indent=2)

root_dir = Path(__file__).resolve().parent.parent
test_data_dir = path_join(root_dir, "test-data")
datasets_cache_dir = path_join(test_data_dir, "datasets")

sample_ND_JSON_PATH = path_join(test_data_dir, "ND-GAIN.json")

with open(sample_ND_JSON_PATH) as file:
    index_model_object = json.load(file)


# Some of these tests are integration+side-effecty-slow
# NOTE Run pytest with:
# $ pytest -m "not integration"

# Or, from tasks proj dir run like:
# python -m pytest -vvs tasks/causemos_processors_test.py


@pytest.mark.integration
def test_iteration_func():

    retrieval_dictionary = iteration_func(index_model_object)

    assert len(retrieval_dictionary) == 15

    # Get the first key-value pair
    first_key = next(iter(retrieval_dictionary))
    first_value = retrieval_dictionary[first_key]

    first_dataset_stored = first_value[0]

    first_dataset_feature = first_dataset_stored["source_column"]
    first_dataset_feature_name = first_dataset_stored["name_in_model"]

    assert first_dataset_feature == "governance"
    assert first_dataset_feature_name == "Governance indicator"

@pytest.mark.integration
@pytest.mark.side_effects
def test_download_datasets():
    out = download_datasets(iteration_func(index_model_object))
    # Dataset ids described and involved in the index nd-gain sample file:
    assert len(out) == 15


@pytest.mark.slow
@pytest.mark.integration
@pytest.mark.side_effects
def test_build_synthetic_dataset():

    rd = iteration_func(index_model_object)
    datasets_ids = download_datasets(rd)

    out = build_synthetic_dataset(datasets_ids, rd)

    assert out.columns.tolist() == [
        "country", "timestamp", "Governance indicator", "Vulnerability indicator", "Capacity indicator", "Governance indicator", "Vulnerability indicator", "Capacity indicator", "Governance indicator", "Vulnerability indicator", "Capacity indicator", "P1: State Legitimacy", "P1: State Legitimacy", "P1: State Legitimacy", "Population per 3km square resolution", "Population per 3km square resolution", "Population per 3km square resolution", "Population", "Population", "Population", "Port Count", "Port Count", "Port Count", "Container port traffic (TEU: 20 foot equivalent units)", "Container port traffic (TEU: 20 foot equivalent units)", "Container port traffic (TEU: 20 foot equivalent units)", "Locations of US Military Bases Abroad", "Locations of US Military Bases Abroad", "Locations of US Military Bases Abroad", "Arms imports (SIPRI trend indicator values)", "Arms imports (SIPRI trend indicator values)", "Arms imports (SIPRI trend indicator values)", "Foreign direct investment, net inflows (% of GDP)", "Foreign direct investment, net inflows (% of GDP)", "Foreign direct investment, net inflows (% of GDP)", "Humanitarian Requirements (USD)", "Humanitarian Requirements (USD)", "Humanitarian Requirements (USD)", "US Aid", "Foreign Aid from ODA Countries", "US Aid", "Foreign Aid from ODA Countries", "US Aid", "Foreign Aid from ODA Countries", "Amount of Chinese Military Aid (Constant USD2017)", "Amount of Chinese Military Aid (Constant USD2017)", "Amount of Chinese Military Aid (Constant USD2017)", "Chinese Aid & Loans", "Chinese Aid & Loans", "Chinese Aid & Loans", "Natural gas rents (% of GDP)", "Mineral rents (% of GDP)", "Total natural resources rents (% of GDP)", "Natural gas rents (% of GDP)", "Mineral rents (% of GDP)", "Total natural resources rents (% of GDP)", "Natural gas rents (% of GDP)", "Mineral rents (% of GDP)", "Total natural resources rents (% of GDP)", "US Imports", "US Exports", "US Imports", "US Exports", "US Imports", "US Exports"
    ]


def gen_control_dataframe(n:int=100):
    """
    Returns something like:
    random1  random2  linear1  linear2  constant
0        51       23        0        0         5
1        92       25        1        1         5
2        14       88        2        2         5
3        71       59        3        3         5
4        60       40        4        4         5
..      ...      ...      ...      ...       ...
95       39        0       95       95         5
96       84       26       96       96         5
97       79       61       97       97         5
98       81       76       98       98         5
99       52        2       99       99         5

[100 rows x 5 columns]

    but with `n` rows.
    """
    numpy.random.seed(42)

    # Generate linearly correlated data
    # linear_data = np.linspace(0, 10, n)  # Linearly increasing values
    # # Combine the data into a DataFrame
    # data = pd.DataFrame({
    #     "Random_1": np.random.normal(0, 1, n),
    #     "Random_2": np.random.normal(0, 1, n),
    #     "Linear_1": linear_data,
    #     "Linear_2": linear_data + np.random.normal(0, 1, n)  # Add random noise to create correlation
    # })

    random1_values = numpy.random.randint(0, 101, size=n)
    random2_values = numpy.random.randint(0, 101, size=n)

    colinear1_values = numpy.arange(n)
    colinear2_values = numpy.arange(n)

    constant_values = numpy.full(n, 5)

    df = pandas.DataFrame({
        "random1": random1_values,
        "random2": random2_values,
        "linear1": colinear1_values,
        "linear2": colinear2_values,
        "constant": constant_values
    })

    return df



roundToFour = partial(round, ndigits=4)


def round_list(my_list):
    return list(map(roundToFour, my_list))


@pytest.mark.integration
def test_perform_pca():

    df = gen_control_dataframe(1000)

    (pca_components_list, pca_components_count, pca_explained_ratios) = perform_pca(df)

    assert pca_components_count == 5
    assert list(map(lambda i: round(i, 4), pca_explained_ratios)) == [0.5004, 0.2602, 0.2393, 0.0, 0.0]

    formatted = list(map(lambda i: round_list(i), pca_components_list.tolist()))

    assert formatted == [
        [0.0011, 0.0401, 0.7065, 0.7065, 0.0],
        [0.7139, 0.6997, 0.0193, 0.0193, 0.0],
        [0.7002, 0.7133, 0.0208, 0.0208, 0.0],
        [0.0, 0.0, 0.7071, 0.7071, 0.0],
        [0.0, 0.0, 0.0, 0.0, 1.0]
    ]


@pytest.mark.integration
def test_pca_to_weights_v3_70():

    pca_details = (
        numpy.array(
            [[1.13900827e-03, 4.01488796e-02, 7.06536188e-01,
              7.06536188e-01, 0.00000000e+00],
             [7.13923827e-01, 6.99690962e-01, 1.93044911e-02,
              1.93044911e-02, 0.00000000e+00],
             [7.00222444e-01, 7.13316638e-01, 2.08315041e-02,
              2.08315041e-02, 0.00000000e+00],
             [2.11047685e-17, 2.19081849e-17, 7.07106781e-01,
              7.07106781e-01, 0.00000000e+00],
             [0.00000000e+00, 0.00000000e+00, 0.00000000e+00,
              0.00000000e+00, 1.00000000e+00]]
        ),

        5,

        numpy.array(
            [5.00405570e-01, 2.60246340e-01, 2.39348091e-01,
             2.51310581e-32, 0.00000000e+00]
        )
    )

    weights = pca_to_weights_v3(pca_details)

    rounded = list(map(lambda i: roundToFour(i), weights.tolist()))

    assert rounded == [0.1685, 0.1829, 0.3243, 0.3243, 0.0]

    assert sum(rounded) == 1



@pytest.mark.integration
def test_pca_to_weights_v3_90():

    pca_details = (
        numpy.array(
            [[1.13900827e-03, 4.01488796e-02, 7.06536188e-01,
              7.06536188e-01, 0.00000000e+00],
             [7.13923827e-01, 6.99690962e-01, 1.93044911e-02,
              1.93044911e-02, 0.00000000e+00],
             [7.00222444e-01, 7.13316638e-01, 2.08315041e-02,
              2.08315041e-02, 0.00000000e+00],
             [2.11047685e-17, 2.19081849e-17, 7.07106781e-01,
              7.07106781e-01, 0.00000000e+00],
             [0.00000000e+00, 0.00000000e+00, 0.00000000e+00,
              0.00000000e+00, 1.00000000e+00]]
        ),

        5,

        numpy.array(
            [5.00405570e-01, 2.60246340e-01, 2.39348091e-01,
             2.51310581e-32, 0.00000000e+00]
        )
    )

    weights = pca_to_weights_v3(pca_details, 0.9)

    rounded = list(map(lambda i: roundToFour(i), weights.tolist()))

    assert rounded == [0.2434, 0.2565, 0.25, 0.25, 0.0]

    assert sum(rounded) > 0.99

