import json

import pprint
from pathlib import Path
from os.path import join as path_join
import pytest
import numpy
import pandas

from tasks.causemos_processors import (
    build_synthetic_dataset,
    normalize_synthetic_dataset,
    perform_pca,
    pca_to_weights_v3,
    iteration_func,
    build_tree,
    download_datasets,
    build_synthetic_dataset
)

pp = pprint.PrettyPrinter(indent=2)

root_dir = Path(__file__).resolve().parent.parent
test_data_dir = path_join(root_dir, "test-data")
datasets_cache_dir = path_join(test_data_dir, "datasets")

sample_ND_JSON_PATH = path_join(test_data_dir, 'ND-GAIN.json')

with open(sample_ND_JSON_PATH) as file:
    index_model_object = json.load(file)


# Some of these tests are integration+side-effecty-slow
# NOTE Run pytest with:
# $ pytest -m "not integration"


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

    assert out.columns == [
        "country", "timestamp", "Governance indicator",
        "Vulnerability indicator", "Capacity indicator", "P1: State Legitimacy",
        "Population per 3km square resolution", "Population", "Port Count",
        "Container port traffic (TEU: 20 foot equivalent units)",
        "Locations of US Military Bases Abroad",
        "Arms imports (SIPRI trend indicator values)",
        "Foreign direct investment, net inflows (% of GDP)",
        "Humanitarian Requirements (USD)", "US Aid",
        "Foreign Aid from ODA Countries",
        "Amount of Chinese Military Aid (Constant USD2017)",
        "Chinese Aid & Loans", "Natural gas rents (% of GDP)",
        "Mineral rents (% of GDP)", "Total natural resources rents (% of GDP)",
        "US Imports", "US Exports"
    ]


@pytest.mark.integration
@pytest.mark.target
def test_perform_pca():

    numpy.random.seed(42)
    random1_values = numpy.random.randint(0, 101, size=100)
    random2_values = numpy.random.randint(0, 101, size=100)

    colinear1_values = numpy.arange(100)
    colinear2_values = numpy.arange(100)

    constant_values = numpy.full(100, 5)

    df = pandas.DataFrame({
        'random1': random1_values,
        'random2': random2_values,
        'colinear1': colinear1_values,
        'colinear2': colinear2_values,
        'constant': constant_values
    })

    (pca_components_list, pca_components_count, pca_explained_ratios) = perform_pca(df)

    assert pca_components_count == 5
    assert list(map(lambda i: round(i, 4), pca_explained_ratios)) == [0.5047, 0.2535, 0.2418, 0.0, 0.0]

    # Transform pca_components_list into regular list
    # pca_components_list
    # assert list(map(lambda i: round(i, 4), )) == []


# def test_stub1():
#     assert True == True
