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

from test_data.pca_index_stub import PCA_INDEX_STUB

from tasks.causemos_processors import (
    build_synthetic_dataset,
    perform_pca,
    pca_to_weights_v3,
    pca_to_weights_v2,
    pca_to_weights_v1,
    iteration_func,
)

# warnings.filterwarnings('ignore')
# pp = pprint.PrettyPrinter(indent=2)

root_dir = Path(__file__).resolve().parent.parent
test_data_dir = path_join(root_dir, "test_data")
datasets_cache_dir = path_join(test_data_dir, "datasets")
sample_ND_JSON_PATH = path_join(test_data_dir, "ND-GAIN.json")


# Some of these tests are integration+side-effecty-slow
# NOTE Run pytest with if you wish to run only unit tests or CI?:
# $ pytest -m "not integration"

# Or, to run all, from tasks proj dir:
# python -m pytest -vvs tasks/causemos_processors_test.py


with open(sample_ND_JSON_PATH) as file:
    index_model_object = json.load(file)

SAMPLE_FEATURES_DICTIONARY_NDGAIN_PATH = path_join(
    test_data_dir,
    "retrieval_dictionary_features_sample_ndgain.json"
)

with open(SAMPLE_FEATURES_DICTIONARY_NDGAIN_PATH) as file:
    index_retrieval_dict_stub = json.load(file)


NORMALIZED_INDEX_DATA = pandas.read_csv(
    path_join(test_data_dir, "normalized_synthetic_dataframe_stub.csv")
)
columns_to_remove = [ '0', 'Unnamed: 0']
for item in columns_to_remove:
    if item in list(NORMALIZED_INDEX_DATA):
        NORMALIZED_INDEX_DATA = NORMALIZED_INDEX_DATA.drop(columns=[item])


# Sample index nd-gain contains 15 datasets, 21 features across them
STUB_DATASET_IDS = [
    '82e418bd-35e1-46df-86ba-75e33cb423ca',
    'a92764c2-a667-415d-9d58-ec8466a84dc7',
    'a3b9431c-ae5c-4efe-aad9-eb4bdc2d9d95',
    '53004696-8ca3-41a7-957d-d9f73cc10ef4',
    '08199584-2e10-48c1-889e-f0e6911d9893',
    '962c458a-5e76-4f87-a739-d8ae0b70deb7',
    '499aed27-9b9c-4d05-97ec-65fd956521cf',
    'e5057175-34d7-4c01-803a-17309e996264',
    'a318111e-587d-4c89-8993-431d5fb0c973',
    'f90cb3d6-47d4-4cf6-8a0e-fd9a15b2f469',
    'e49d8b28-2618-4874-ac92-88fa25714372',
    'db48c2bb-9080-41d6-a5b9-916c0c6871f1',
    '9e9da0d0-8494-4a1e-a312-45eb1b0a77be',
    '62fcdd55-1459-41c8-b815-e5fd90e06587',
    '371ca304-a94c-4c67-ae28-6933c7493e9a'
]


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


@pytest.mark.slow
@pytest.mark.integration
@pytest.mark.skip
def test_build_synthetic_dataset():
    """
    You'll need actual datasets for the sample nd-gain in order to populate
    the test_data/datasets/* folder and for this integration test to pass.
    Test skipped for now.
    """

    rd = index_retrieval_dict_stub

    datasets_ids = STUB_DATASET_IDS

    out = build_synthetic_dataset(datasets_ids, rd)

    sorted_columns_list = sorted(out.columns.tolist(), key=str.lower)

    assert sorted_columns_list == ['Amount of Chinese Military Aid (Constant USD2017)', 'Arms imports (SIPRI trend indicator values)', 'Capacity indicator', 'Chinese Aid & Loans', 'Container port traffic (TEU: 20 foot equivalent units)', 'country', 'Foreign Aid from ODA Countries', 'Foreign direct investment, net inflows (% of GDP)', 'Governance indicator', 'Humanitarian Requirements (USD)', 'Locations of US Military Bases Abroad', 'Mineral rents (% of GDP)', 'Natural gas rents (% of GDP)', 'P1: State Legitimacy', 'Population', 'Population per 3km square resolution', 'Port Count', 'timestamp', 'Total natural resources rents (% of GDP)', 'US Aid', 'US Exports', 'US Imports', 'Vulnerability indicator']
    assert len(sorted_columns_list) == 23  # 21 features + country and timestamp columns


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

def format_percentages(numbers: List[float]):
    """
    """
    return ['{:.2%}'.format(round(num, 4)) for num in numbers]

def get_raw_floats(pretty_percents_list: List[str]):
    return list(map(lambda i: float(i.replace('%','')), pretty_percents_list))



@pytest.mark.integration
def test_perform_pca__control_data():

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
def test_perform_pca__real_index_data():

    df = NORMALIZED_INDEX_DATA

    (pca_components_list, pca_components_count, pca_explained_ratios) = perform_pca(df)

    assert pca_components_count == 21

    rounded_ratios = list(map(lambda i: round(i, 4), pca_explained_ratios))
    assert rounded_ratios == [
        0.15, 0.0981, 0.0918, 0.0698, 0.0555, 0.0514,
        0.0511, 0.0505, 0.0499, 0.0496, 0.0492, 0.0476, 0.0427, 0.0413, 0.0376,
        0.0288, 0.0176, 0.0095, 0.0043, 0.004, 0.0
    ]

    formatted_components_list = list(map(lambda i: round_list(i), pca_components_list.tolist()))

    assert formatted_components_list == [
        [0.439, 0.4755, 0.4909, 0.2492, 0.0175, 0.0655, 0.0, 0.1583, 0.0593,
         0.0665, 0.0199, 0.0103, 0.0877, 0.0735, 0.0028, 0.023, 0.0195, 0.0251,
         0.1051, 0.3245, 0.3301],
        [0.229, 0.2108, 0.1971, 0.1574, 0.0319, 0.2709, 0.0, 0.372, 0.047,
         0.1897, 0.0451, 0.0857, 0.2716, 0.2996, 0.015, 0.0317, 0.0005, 0.0038,
         0.0339, 0.4963, 0.4085],
        [0.1774, 0.1767, 0.1796, 0.0156, 0.0363, 0.0807, 0.0, 0.1383, 0.0043,
         0.0593, 0.0345, 0.2171, 0.6155, 0.6096, 0.0097, 0.0078, 0.0239,
         0.0237, 0.065, 0.2007, 0.1725],
        [0.0164, 0.1276, 0.0981, 0.0486, 0.0064, 0.0357, 0.0, 0.0412, 0.0274,
         0.0115, 0.0727, 0.0271, 0.0196, 0.0196, 0.0034, 0.0725, 0.6642,
         0.2159, 0.6831, 0.017, 0.0287],
        [0.0333, 0.1077, 0.1057, 0.1177, 0.0691, 0.477, 0.0, 0.2172, 0.024,
         0.6543, 0.0019, 0.03, 0.0614, 0.0118, 0.0573, 0.1283, 0.0422, 0.1396,
         0.02, 0.2525, 0.3796],
        [0.0547, 0.0606, 0.0507, 0.2651, 0.065, 0.082, 0.0, 0.055, 0.4095,
         0.1662, 0.2321, 0.0148, 0.0075, 0.0299, 0.3501, 0.6216, 0.0998,
         0.3421, 0.0991, 0.0622, 0.0809],
        [0.0007, 0.0418, 0.0401, 0.0118, 0.0512, 0.0604, 0.0, 0.0463, 0.2361,
         0.0182, 0.3017, 0.009, 0.0053, 0.0086, 0.2425, 0.3018, 0.335, 0.7587,
         0.0078, 0.0302, 0.0457],
        [0.0514, 0.0309, 0.0261, 0.1626, 0.2326, 0.1006, 0.0, 0.1108, 0.6499,
         0.0633, 0.328, 0.0161, 0.0006, 0.0029, 0.5153, 0.2611, 0.0272, 0.1532,
         0.001, 0.0227, 0.0026],
        [0.0239, 0.0119, 0.0018, 0.0282, 0.9354, 0.0597, 0.0, 0.0346, 0.16,
         0.0381, 0.2701, 0.0664, 0.0151, 0.0268, 0.0046, 0.0015, 0.012, 0.1094,
         0.02, 0.0137, 0.0262],
        [0.0431, 0.0626, 0.0479, 0.0878, 0.216, 0.0435, 0.0, 0.0141, 0.1876,
         0.0299, 0.7282, 0.0141, 0.0099, 0.0199, 0.4954, 0.2258, 0.0143,
         0.2584, 0.0711, 0.0005, 0.0051],
        [0.0412, 0.0017, 0.0126, 0.0402, 0.0491, 0.0671, 0.0, 0.0262, 0.4416,
         0.0403, 0.356, 0.0112, 0.0061, 0.0074, 0.5472, 0.5655, 0.0803, 0.1989,
         0.0029, 0.0072, 0.0087],
        [0.0273, 0.0042, 0.0088, 0.0181, 0.0482, 0.0221, 0.0, 0.0153, 0.0038,
         0.0448, 0.0365, 0.9659, 0.1923, 0.1451, 0.0094, 0.0264, 0.0185,
         0.0154, 0.0092, 0.0026, 0.0059],
        [0.0001, 0.1313, 0.1239, 0.6199, 0.0441, 0.6159, 0.0, 0.2279, 0.1054,
         0.2845, 0.0219, 0.0613, 0.0054, 0.0673, 0.0586, 0.1743, 0.0511,
         0.0956, 0.0553, 0.0193, 0.0031],
        [0.0087, 0.1505, 0.1427, 0.5347, 0.0531, 0.4851, 0.0, 0.0591, 0.2817,
         0.5401, 0.0429, 0.0005, 0.0513, 0.0679, 0.0276, 0.1168, 0.0608,
         0.0712, 0.1206, 0.0197, 0.1053],
        [0.0257, 0.0437, 0.0361, 0.27, 0.0118, 0.184, 0.0, 0.8098, 0.0115,
         0.3264, 0.0025, 0.0138, 0.032, 0.0006, 0.0119, 0.088, 0.0676, 0.0708,
         0.0288, 0.0845, 0.3164],
        [0.0597, 0.0938, 0.1024, 0.0702, 0.0068, 0.0289, 0.0, 0.0081, 0.0178,
         0.0974, 0.0351, 0.0019, 0.003, 0.0108, 0.0069, 0.0214, 0.6439, 0.2794,
         0.6831, 0.0152, 0.0067],
        [0.8356, 0.3878, 0.2764, 0.1993, 0.0079, 0.0354, 0.0, 0.0102, 0.0145,
         0.004, 0.0608, 0.0219, 0.0239, 0.0572, 0.0069, 0.0849, 0.0145, 0.0246,
         0.1263, 0.0114, 0.0364],
        [0.0444, 0.036, 0.0093, 0.0388, 0.0126, 0.0459, 0.0, 0.0152, 0.0022,
         0.0341, 0.0038, 0.0332, 0.7023, 0.7044, 0.0036, 0.0052, 0.0052,
         0.0045, 0.0086, 0.0244, 0.0123],
        [0.0805, 0.4722, 0.5231, 0.0049, 0.0067, 0.0365, 0.0, 0.1294, 0.0041,
         0.0067, 0.0043, 0.0053, 0.0242, 0.0285, 0.0058, 0.005, 0.0116, 0.0027,
         0.0021, 0.5189, 0.4559],
        [0.0208, 0.4843, 0.5119, 0.0104, 0.0063, 0.0436, 0.0, 0.1429, 0.0133,
         0.0065, 0.0006, 0.0042, 0.0024, 0.0052, 0.0069, 0.0012, 0.0148,
         0.0096, 0.0043, 0.5103, 0.4684],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
         0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    ]



@pytest.mark.integration
def test_pca_to_weights_v3_70_control_data():

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

    rounded = format_percentages(weights.tolist())

    assert rounded == ['16.85%', '18.29%', '32.43%', '32.43%', '0.00%']


@pytest.mark.integration
def test_pca_to_weights_v3_90_control_data():

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

    rounded = format_percentages(weights.tolist())

    assert rounded == ['24.34%', '25.65%', '25.00%', '25.00%', '0.00%']


@pytest.mark.integration
def test_pca_to_weights_v3_70_explained_sum_real_index_datasets():

    pca_details = PCA_INDEX_STUB

    weights = pca_to_weights_v3(pca_details)

    rounded = format_percentages(weights.tolist())

    assert rounded == ['5.76%', '6.61%', '6.46%', '4.57%', '4.37%', '4.47%', '0.00%', '5.00%', '4.96%', '4.31%', '5.40%', '1.95%', '5.09%', '5.09%', '4.32%', '4.52%', '3.90%', '5.51%', '4.15%', '6.80%', '6.76%']


@pytest.mark.integration
def test_pca_to_weights_v3_90_explained_sum_real_index_datasets():

    pca_details = PCA_INDEX_STUB

    weights = pca_to_weights_v3(pca_details, target_pca_explained_sum=0.9)

    rounded = format_percentages(weights.tolist())

    assert rounded == ['4.74%', '5.77%', '5.65%', '6.03%', '3.82%', '5.79%', '0.00%', '5.71%', '5.44%', '5.40%', '5.14%', '3.49%', '4.54%', '4.53%', '4.65%', '5.32%', '3.56%', '5.16%', '3.64%', '5.59%', '6.02%']


def test_pca_to_weights_v2_control_data():

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

    weights = pca_to_weights_v2(pca_details)

    rounded = format_percentages(weights)

    assert rounded == ['32.45%', '33.32%', '17.11%', '17.11%', '0.00%']


def test_pca_to_weights_v2_real_index_data():

    pca_details = PCA_INDEX_STUB

    weights = pca_to_weights_v2(pca_details)

    rounded = format_percentages(weights)

    assert rounded == [
        '2.82%', '3.95%', '3.76%', '5.90%', '6.07%', '6.22%', '0.00%',
        '3.75%', '7.03%', '5.51%', '7.08%', '5.75%', '3.66%', '3.68%',
        '6.23%', '6.71%', '4.24%', '6.64%', '3.72%', '3.45%', '3.83%'
    ]


@pytest.mark.integration
def test_pca_to_weights_v1_control_data():

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

    weights = pca_to_weights_v1(pca_details)

    rounded = format_percentages(weights)

    assert rounded == ['24.34%', '25.65%', '25.00%', '25.00%', '0.00%']


@pytest.mark.integration
def test_pca_to_weights_v1_real_index_data():

    pca_details = PCA_INDEX_STUB

    weights = pca_to_weights_v1(pca_details)

    rounded = format_percentages(weights)

    assert rounded == [
        '5.14%', '5.99%', '5.81%', '5.94%', '3.65%', '5.58%', '0.00%', '5.48%',
        '5.19%', '5.25%', '4.96%', '3.34%', '4.58%', '4.60%', '4.43%', '5.13%',
        '4.08%', '5.21%', '4.27%', '5.50%', '5.89%']

