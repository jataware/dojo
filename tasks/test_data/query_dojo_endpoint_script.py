import requests

url = "http://localhost:8000/dojo/index_model_weight/generate"

querystring = {"explained_variance_threshold":"0.8"}

payload = {
    "id": "c9fac500-8c33-4850-bcca-8837cc23df29",
    "title": "ND Gain Index Model 1 - National Interest & High-Level Climate",
    "description": "",
    "project_id": "project-2a6fcd02-9a01-4c3c-84b4-9a95b3f25b60",
    "created_at": 1678277903557,
    "modified_at": 1681414778197,
    "state": {
        "index": {
            "id": "f537233e-17eb-4fa9-b02c-b6afd7d55bfa",
            "type": "OutputIndex",
            "name": "Overall priority",
            "inputs": [
                {
                    "isWeightUserSpecified": False,
                    "inputs": [
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1577836800000,
                                    "datasetName": "Governance indicator",
                                    "weight": 50,
                                    "source": "ND-GAIN Vulnerability and Readiness Indicators",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "96d2de9b-babd-4418-9c0d-26681772f805",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "governance",
                                    "temporalAggregation": "mean",
                                    "name": "Governance indicator",
                                    "datasetId": "82e418bd-35e1-46df-86ba-75e33cb423ca",
                                    "id": "8f21b14a-c8eb-4cbf-9035-f63b215a4084",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 1609459200000,
                                    "datasetName": "P1: State Legitimacy",
                                    "weight": 50,
                                    "source": "Fragile States Index - East Africa - 2015-2021 - fsi-2015-2021.xlsx",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "da1bbbbf-7e73-49d4-8f80-be27f9fe5c3d",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "P1: State Legitimacy",
                                    "temporalAggregation": "mean",
                                    "name": "P1: State Legitimacy",
                                    "datasetId": "a92764c2-a667-415d-9d58-ec8466a84dc7",
                                    "id": "bf06a867-424a-46e0-9c0e-4ac8fd2a6ec9",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Governance",
                            "weight": 16.666666666666668,
                            "id": "cc43a56e-8d8e-4a8d-944b-c90d70598e04",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1577836800000,
                                    "datasetName": "Population per 3km square resolution",
                                    "weight": 50,
                                    "source": "Oak Ridge Laboratory - Landscan East Africa Population - 3km rectangle - 2020 - East_Africa_Population_3km_2020.tif",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "67105840-9600-41a1-8887-b3d409c878a6",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "PopulationPer3kmResolution",
                                    "temporalAggregation": "mean",
                                    "name": "Population per 3km square resolution",
                                    "datasetId": "a3b9431c-ae5c-4efe-aad9-eb4bdc2d9d95",
                                    "id": "5a19dd82-f60e-41af-b596-a98d11e5a1ec",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 4102444800000,
                                    "datasetName": "Population",
                                    "weight": 50,
                                    "source": "International Population Census",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "a6e9ee10-f562-4300-a7a2-6be091a5fe83",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "POP",
                                    "temporalAggregation": "mean",
                                    "name": "Population",
                                    "datasetId": "53004696-8ca3-41a7-957d-d9f73cc10ef4",
                                    "id": "0740ca61-2056-47a6-b1a8-bf4724224e14",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Population",
                            "weight": 16.666666666666668,
                            "id": "ce7429fc-9228-4616-aa02-6db347da2eed",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "name": "Distance to Foreign Adversaries",
                                            "id": "864e9109-5968-4954-bc10-4cf89fdb960f",
                                            "type": "Placeholder"
                                        }
                                    ],
                                    "name": "Proximity to Foreign Adversaries",
                                    "weight": 33.333333333333336,
                                    "id": "70eafef5-13ef-4557-af89-25989edab6b7",
                                    "type": "Index"
                                },
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "selectedTimestamp": 1564617600000,
                                            "datasetName": "Port Count",
                                            "weight": 50,
                                            "source": "International Ports - National Geospatial-Intelligence Agency World Port Index - 2019 - bq-results-20220110-141400-ckf5anmzl6jt.xlsx",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "169a73da-c5f2-484b-a93d-1426f50b0240",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "port_count",
                                            "temporalAggregation": "mean",
                                            "name": "Port Count",
                                            "datasetId": "08199584-2e10-48c1-889e-f0e6911d9893",
                                            "id": "b6de31ed-b0c9-4b45-a0ca-396da47478c1",
                                            "runId": "indicator",
                                            "isInverted": False
                                        },
                                        {
                                            "selectedTimestamp": 1575158400000,
                                            "datasetName": "Container port traffic (TEU: 20 foot equivalent units)",
                                            "weight": 50,
                                            "source": "WDI - infrastructure",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "3c86dabc-fe64-4af8-9b59-22d73da271b3",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "IS.SHP.GOOD.TU",
                                            "temporalAggregation": "mean",
                                            "name": "Container port traffic (TEU: 20 foot equivalent units)",
                                            "datasetId": "962c458a-5e76-4f87-a739-d8ae0b70deb7",
                                            "id": "e3ff47ac-8e09-4235-9584-23946ed958e0",
                                            "runId": "indicator",
                                            "isInverted": False
                                        }
                                    ],
                                    "name": "Transportation Routes",
                                    "weight": 33.333333333333336,
                                    "id": "c9f861fb-9aab-4f94-b4af-c1480e1a1f1d",
                                    "type": "Index"
                                },
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "selectedTimestamp": 1546300800000,
                                            "datasetName": "",
                                            "weight": 100,
                                            "source": "U.S. Military Bases Abroad, 1989-2019",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "93e6c7ff-972f-4c6e-b145-e28b550bf964",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "Total U.S. Military Bases",
                                            "temporalAggregation": "mean",
                                            "name": "Locations of US Military Bases Abroad",
                                            "datasetId": "499aed27-9b9c-4d05-97ec-65fd956521cf",
                                            "id": "59cfca31-aeea-4b8c-92ff-8b15c253c0d4",
                                            "runId": "indicator",
                                            "isInverted": False
                                        }
                                    ],
                                    "name": "US Military Bases",
                                    "weight": 33.333333333333336,
                                    "id": "eb086062-b43d-4c55-b1ee-3b1a41bfdc6e",
                                    "type": "Index"
                                }
                            ],
                            "name": "Strategic Location",
                            "weight": 16.666666666666668,
                            "id": "ff79ffab-3222-49ed-b9c5-09d33de40d1a",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1575158400000,
                                    "datasetName": "Arms imports (SIPRI trend indicator values)",
                                    "weight": 16.666666666666668,
                                    "source": "WDI - missiles",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "55892586-e99d-4630-be2f-4112dcf55fb4",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "MS.MIL.MPRT.KD",
                                    "temporalAggregation": "mean",
                                    "name": "Arms imports (SIPRI trend indicator values)",
                                    "datasetId": "e5057175-34d7-4c01-803a-17309e996264",
                                    "id": "f82b0788-f4ae-4f5e-8758-9349af0c5703",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "selectedTimestamp": 1609459200000,
                                            "datasetName": "",
                                            "weight": 100,
                                            "source": "OECD Foreign Aid Data - Global Sample - 20116-2021",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "f8f28681-c3ca-4a76-8982-8cba00930d15",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "US Aid Total (Current USD Millions)",
                                            "temporalAggregation": "mean",
                                            "name": "US Aid",
                                            "datasetId": "e49d8b28-2618-4874-ac92-88fa25714372",
                                            "id": "77f95e3c-ae68-431f-ba5a-45c6100343b6",
                                            "runId": "indicator",
                                            "isInverted": False
                                        }
                                    ],
                                    "name": "United States Aid",
                                    "weight": 16.666666666666668,
                                    "id": "f6f48df8-f0bb-4760-aaa5-c3838b0c5901",
                                    "type": "Index"
                                },
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "selectedTimestamp": 1609459200000,
                                            "datasetName": "",
                                            "weight": 100,
                                            "source": "OECD Foreign Aid Data - Global Sample - 20116-2021",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "95341d93-8c8a-4953-8845-06dcc98bcc06",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "ODA Aid Total (Current Prices in USD millions)",
                                            "temporalAggregation": "mean",
                                            "name": "Foreign Aid from ODA Countries",
                                            "datasetId": "e49d8b28-2618-4874-ac92-88fa25714372",
                                            "id": "562723ff-0ffa-4f16-a00b-8af13ddc2f93",
                                            "runId": "indicator",
                                            "isInverted": False
                                        }
                                    ],
                                    "name": "ODA  Aid",
                                    "weight": 16.666666666666668,
                                    "id": "1bb6d1aa-7f0f-4c52-be23-c60571328699",
                                    "type": "Index"
                                },
                                {
                                    "isWeightUserSpecified": False,
                                    "inputs": [
                                        {
                                            "selectedTimestamp": 978307200000,
                                            "datasetName": "Amount of Chinese Military Aid (Constant USD2017)",
                                            "weight": 50,
                                            "source": "Chinese Military Aid - Global - AIDDATA - 2021",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "51a5648c-e03e-4fcc-b8fd-13a5ab851b03",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "Amount (Constant USD2017)",
                                            "temporalAggregation": "mean",
                                            "name": "Amount of Chinese Military Aid (Constant USD2017)",
                                            "datasetId": "db48c2bb-9080-41d6-a5b9-916c0c6871f1",
                                            "id": "fd6407f2-de52-4fb5-837e-39de340bb0f3",
                                            "runId": "indicator",
                                            "isInverted": False
                                        },
                                        {
                                            "selectedTimestamp": 1483228800000,
                                            "datasetName": "",
                                            "weight": 50,
                                            "source": "Chinese Investments - Global - AIDDATA 2021",
                                            "type": "Dataset",
                                            "datasetMetadataDocId": "0a84e991-ead5-418e-9190-5b9c49bfb664",
                                            "isWeightUserSpecified": False,
                                            "spatialAggregation": "mean",
                                            "temporalResolution": "month",
                                            "outputVariable": "Amount (Constant USD2017)",
                                            "temporalAggregation": "mean",
                                            "name": "Chinese Aid & Loans",
                                            "datasetId": "9e9da0d0-8494-4a1e-a312-45eb1b0a77be",
                                            "id": "80bf83bb-1e48-482c-becf-edc2c4a8246c",
                                            "runId": "indicator",
                                            "isInverted": False
                                        }
                                    ],
                                    "name": "Chinese Investment",
                                    "weight": 16.666666666666668,
                                    "id": "fbc5d997-ec4e-431b-8dda-f379dbabe722",
                                    "type": "Index"
                                },
                                {
                                    "selectedTimestamp": 1575158400000,
                                    "datasetName": "Foreign direct investment, net inflows (% of GDP)",
                                    "weight": 16.666666666666668,
                                    "source": "WDI - balance_exports",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "b5bbf592-81ed-4ed8-8815-5fe43de57608",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "BX.KLT.DINV.WD.GD.ZS",
                                    "temporalAggregation": "mean",
                                    "name": "Foreign direct investment, net inflows (% of GDP)",
                                    "datasetId": "a318111e-587d-4c89-8993-431d5fb0c973",
                                    "id": "86475273-a6d3-41aa-8968-2111a4281e96",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 1672531200000,
                                    "datasetName": "Humanitarian Requirements (USD)",
                                    "weight": 16.666666666666668,
                                    "source": "OCHA Global Humanitarian Overview - 2017-2023 - Humanitarian Requirements in USD",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "e27e2717-246f-4af3-9606-9f8efc255a51",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "Requirements (US$)",
                                    "temporalAggregation": "mean",
                                    "name": "Humanitarian Requirements (USD)",
                                    "datasetId": "f90cb3d6-47d4-4cf6-8a0e-fd9a15b2f469",
                                    "id": "d619004f-9674-46e0-922d-c9c9d3a72973",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Foreign Investment",
                            "weight": 16.666666666666668,
                            "id": "b0e5c3f8-3bed-4419-8913-78f1fcb0a354",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1575158400000,
                                    "datasetName": "Natural gas rents (% of GDP)",
                                    "weight": 33.333333333333336,
                                    "source": "WDI - national_accounts",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "7aac350d-4cc4-4524-b97c-b6f603b2f79e",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "NY.GDP.NGAS.RT.ZS",
                                    "temporalAggregation": "mean",
                                    "name": "Natural gas rents (% of GDP)",
                                    "datasetId": "62fcdd55-1459-41c8-b815-e5fd90e06587",
                                    "id": "580735a3-29e8-49e2-b7a4-0df503833410",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 1575158400000,
                                    "datasetName": "Mineral rents (% of GDP)",
                                    "weight": 33.333333333333336,
                                    "source": "WDI - national_accounts",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "a9bb6389-f10e-4318-9a23-08f8676ea121",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "NY.GDP.MINR.RT.ZS",
                                    "temporalAggregation": "mean",
                                    "name": "Mineral rents (% of GDP)",
                                    "datasetId": "62fcdd55-1459-41c8-b815-e5fd90e06587",
                                    "id": "87de03d1-7fb5-407b-9267-f9614ca8f191",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 1575158400000,
                                    "datasetName": "Total natural resources rents (% of GDP)",
                                    "weight": 33.333333333333336,
                                    "source": "WDI - national_accounts",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "93efcce3-cbd5-4f76-b71d-36c4ae8c3bc4",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "NY.GDP.TOTL.RT.ZS",
                                    "temporalAggregation": "mean",
                                    "name": "Total natural resources rents (% of GDP)",
                                    "datasetId": "62fcdd55-1459-41c8-b815-e5fd90e06587",
                                    "id": "dde4a1d7-9df2-42e7-8e76-f8ef1fbeb5e5",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Natural Resources",
                            "weight": 16.666666666666668,
                            "id": "f768a289-f132-4e66-83fe-7a042fa9e261",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1640995200000,
                                    "datasetName": "",
                                    "weight": 50,
                                    "source": "U.S. Trade in Goods by Country",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "9483646f-51df-4501-8fef-459387333961",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "imports",
                                    "temporalAggregation": "mean",
                                    "name": "US Imports",
                                    "datasetId": "371ca304-a94c-4c67-ae28-6933c7493e9a",
                                    "id": "f15b0ca8-c007-496e-8b3f-1e3bfcdaf237",
                                    "runId": "indicator",
                                    "isInverted": False
                                },
                                {
                                    "selectedTimestamp": 1640995200000,
                                    "datasetName": "",
                                    "weight": 50,
                                    "source": "U.S. Trade in Goods by Country",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "f53bd527-e32e-46ce-8b3a-a58cfafff3cd",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "exports",
                                    "temporalAggregation": "mean",
                                    "name": "US Exports",
                                    "datasetId": "371ca304-a94c-4c67-ae28-6933c7493e9a",
                                    "id": "fa1ca197-c439-4423-961f-ce131f01bfcb",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "US Trade",
                            "weight": 16.666666666666668,
                            "id": "3140f82d-b3ed-4522-a6b9-f80eb66c615d",
                            "type": "Index"
                        }
                    ],
                    "name": "National Interest",
                    "weight": 50,
                    "id": "35162d07-5a5a-427a-b62f-5cc6880cba1e",
                    "type": "Index"
                },
                {
                    "isWeightUserSpecified": False,
                    "inputs": [
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1577836800000,
                                    "datasetName": "Vulnerability indicator",
                                    "weight": 100,
                                    "source": "ND-GAIN Vulnerability and Readiness Indicators",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "5f71e5f6-7d48-4029-aecc-47307506c26c",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "vulnerability",
                                    "temporalAggregation": "mean",
                                    "name": "Vulnerability indicator",
                                    "datasetId": "82e418bd-35e1-46df-86ba-75e33cb423ca",
                                    "id": "28d4e644-5a6c-487c-b0e9-eae1ad72b9c2",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Climate Vulnerability",
                            "weight": 50,
                            "id": "4796634e-d6b0-41fc-aa6e-ae3bed3cdc65",
                            "type": "Index"
                        },
                        {
                            "isWeightUserSpecified": False,
                            "inputs": [
                                {
                                    "selectedTimestamp": 1577836800000,
                                    "datasetName": "Capacity indicator",
                                    "weight": 100,
                                    "source": "ND-GAIN Vulnerability and Readiness Indicators",
                                    "type": "Dataset",
                                    "datasetMetadataDocId": "b6b59d35-5dfb-4497-8585-683c5c748be2",
                                    "isWeightUserSpecified": False,
                                    "spatialAggregation": "mean",
                                    "temporalResolution": "month",
                                    "outputVariable": "capacity",
                                    "temporalAggregation": "mean",
                                    "name": "Capacity indicator",
                                    "datasetId": "82e418bd-35e1-46df-86ba-75e33cb423ca",
                                    "id": "ecef713a-746d-4630-b993-ef84667b26d7",
                                    "runId": "indicator",
                                    "isInverted": False
                                }
                            ],
                            "name": "Adaptive Capactiy",
                            "weight": 50,
                            "id": "5f4bbcf3-942e-41fc-b275-17f3839fc93d",
                            "type": "Index"
                        }
                    ],
                    "name": "Climate Risk",
                    "weight": 50,
                    "id": "dd77e44f-36d5-490f-b24b-4fecdf47c3cd",
                    "type": "Index"
                }
            ]
        },
        "workBench": [],
        "resultsSettings": {
            "color": "PRIORITIZATION",
            "colorScale": "Quantize",
            "numberOfColorBins": 5
        }
    }
}
headers = {"Content-Type": "application/json"}

response = requests.request("POST", url, json=payload, headers=headers, params=querystring)

print(response.text)
