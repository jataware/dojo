from __future__ import annotations

# from elasticsearch import Elasticsearch
# from settings import settings


# es_url = settings.ELASTICSEARCH_URL
# es = Elasticsearch(es_url)
import xarray as xr
from flowcast.pipeline import Pipeline, Variable, Threshold, ThresholdType
from flowcast.regrid import RegridType
from collections import defaultdict, deque
from typing import TypedDict, Callable


import json
import pdb
example_flowcast = json.loads(
"""
{
  "nodes": [
    {
      "type": "load",
      "data": {
        "label": "load",
        "input": {
          "data_source": "d_flood::8987a98e-4128-4602-9f72-e3efa1b53668",
          "geo_aggregation_function": "min",
          "time_aggregation_function": "median"
        }
      },
      "id": "n_90d60ae6-a0d1-4fb7-960e-640843bff138"
    },
    {
      "type": "threshold",
      "data": {
        "label": "threshold",
        "input": {
          "value": "12",
          "type": "greater_than"
        }
      },
      "id": "n_156a6819-b768-45ee-bceb-1e7c7c96bf03"
    },
    {
      "type": "load",
      "data": {
        "label": "load",
        "input": {
          "data_source": "time::27d2e4ec-ba65-4fab-8bae-3837fb94ff77",
          "geo_aggregation_function": "nearest_or_mode",
          "time_aggregation_function": "interp_or_mean"
        }
      },
      "id": "n_a6427ee5-c157-4712-997a-151960178e7e"
    },
    {
      "type": "threshold",
      "data": {
        "label": "threshold",
        "input": {
          "value": "50",
          "type": "not_equal"
        }
      },
      "id": "n_0f93f05a-3544-43b7-8848-a67370a4900c"
    },
    {
      "type": "multiply",
      "data": {
        "label": "multiply"
      },
      "id": "n_6bc17cac-9ff3-4609-8097-df4557bb89f6"
    },
    {
      "type": "save",
      "data": {
        "label": "save",
        "input": "example"
      },
      "id": "n_6e6fa654-ffcb-4278-8638-e15aace3a49e"
    }
  ],
  "edges": [
    {
      "source": "n_90d60ae6-a0d1-4fb7-960e-640843bff138",
      "target": "n_156a6819-b768-45ee-bceb-1e7c7c96bf03",
      "id": "reactflow__edge-n_90d60ae6-a0d1-4fb7-960e-640843bff138-n_156a6819-b768-45ee-bceb-1e7c7c96bf03"
    },
    {
      "source": "n_0f93f05a-3544-43b7-8848-a67370a4900c",
      "target": "n_6bc17cac-9ff3-4609-8097-df4557bb89f6",
      "id": "reactflow__edge-n_0f93f05a-3544-43b7-8848-a67370a4900c-n_6bc17cac-9ff3-4609-8097-df4557bb89f6multiply-handle-2"
    },
    {
      "source": "n_156a6819-b768-45ee-bceb-1e7c7c96bf03",
      "target": "n_6bc17cac-9ff3-4609-8097-df4557bb89f6",
      "id": "reactflow__edge-n_156a6819-b768-45ee-bceb-1e7c7c96bf03-n_6bc17cac-9ff3-4609-8097-df4557bb89f6multiply-handle-1"
    },
    {
      "source": "n_a6427ee5-c157-4712-997a-151960178e7e",
      "target": "n_0f93f05a-3544-43b7-8848-a67370a4900c",
      "id": "reactflow__edge-n_a6427ee5-c157-4712-997a-151960178e7e-n_0f93f05a-3544-43b7-8848-a67370a4900c"
    },
    {
      "source": "n_6bc17cac-9ff3-4609-8097-df4557bb89f6",
      "target": "n_6e6fa654-ffcb-4278-8638-e15aace3a49e",
      "id": "reactflow__edge-n_6bc17cac-9ff3-4609-8097-df4557bb89f6-n_6e6fa654-ffcb-4278-8638-e15aace3a49e"
    }
  ],
  "resolution": {
    "geoResolutionColumn": "d_flood::8987a98e-4128-4602-9f72-e3efa1b53668",
    "timeResolutionColumn": "monthly"
  }
}
"""
)


example_header = json.loads(
"""
{
  "metadata": {
    "transformations": null,
    "histograms": {
      "datetime": null,
      "X": {
        "bins": [
          36.3,
          36.6933333333,
          37.0866666667,
          37.48,
          37.8733333333,
          38.2666666667,
          38.66,
          39.0533333333,
          39.4466666667,
          39.84,
          40.2333333333
        ],
        "values": [
          102384,
          102384,
          102384,
          93852,
          102384,
          102384,
          93852,
          102384,
          102384,
          102384
        ]
      },
      "d_flood": {
        "bins": [
          0,
          0.0000205446,
          0.0000410892,
          0.0000616338,
          0.0000821784,
          0.000102723,
          0.0001232676,
          0.0001438122,
          0.0001643568,
          0.0001849014,
          0.000205446
        ],
        "values": [
          1006542,
          44,
          47,
          88,
          7,
          9,
          13,
          10,
          9,
          7
        ]
      },
      "Y": {
        "bins": [
          -3.5733333333,
          -3.31,
          -3.0466666667,
          -2.7833333333,
          -2.52,
          -2.2566666667,
          -1.9933333333,
          -1.73,
          -1.4666666667,
          -1.2033333333,
          -0.94
        ],
        "values": [
          101952,
          101952,
          101952,
          101952,
          89208,
          101952,
          101952,
          101952,
          101952,
          101952
        ]
      },
      "time": null
    },
    "column_statistics": {
      "datetime": {
        "top": "2015-01-01 00:00:00",
        "unique": 108,
        "count": 1006776,
        "freq": 9322
      },
      "X": {
        "std": 1.1451197237,
        "25%": 37.2749287749,
        "min": 36.3,
        "max": 40.2333333333,
        "mean": 38.2666666667,
        "75%": 39.2584045584,
        "count": 1006776,
        "50%": 38.2666666667
      },
      "d_flood": {
        "std": 0.0000013154,
        "25%": 0,
        "min": 0,
        "max": 0.000205446,
        "mean": 1.78e-8,
        "75%": 0,
        "count": 1006776,
        "50%": 0
      },
      "Y": {
        "std": 0.7698624215,
        "25%": -2.9318803419,
        "min": -3.5733333333,
        "max": -0.94,
        "mean": -2.2566666667,
        "75%": -1.5814529915,
        "count": 1006776,
        "50%": -2.2566666667
      },
      "time": {
        "top": "0 days 00:00:00",
        "unique": 108,
        "count": 1006776,
        "freq": 9322
      }
    },
    "files": {
      "raw_data.nc": {
        "filetype": "netcdf",
        "filename": "samplenetcdf.nc",
        "rawFileName": "raw_data.nc"
      }
    },
    "geotime_classify": {
      "datetime": {
        "format": "%Y-%m-%d %H:%M:%S",
        "type_inference": "str",
        "category": "time",
        "subcategory": "date"
      },
      "time": {
        "format": null,
        "type_inference": "str",
        "category": "time",
        "subcategory": "date"
      }
    }
  },
  "annotations": {
    "geo": [],
    "date": [
      {
        "name": "datetime",
        "display_name": "datetime",
        "description": "test",
        "type": "date",
        "date_type": "date",
        "primary_date": true,
        "time_format": "%Y-%m-%d %H:%M:%S",
        "associated_columns": null,
        "qualifies": [],
        "aliases": {}
      }
    ],
    "feature": [
      {
        "name": "time",
        "display_name": "time",
        "description": "feat1",
        "type": "feature",
        "feature_type": "str",
        "units": "feat1",
        "units_description": "",
        "qualifies": [],
        "qualifierrole": "breakdown",
        "aliases": {}
      },
      {
        "name": "X",
        "display_name": "X",
        "description": "feat2",
        "type": "feature",
        "feature_type": "float",
        "units": "feat2",
        "units_description": "",
        "qualifies": [],
        "qualifierrole": "breakdown",
        "aliases": {}
      },
      {
        "name": "Y",
        "display_name": "Y",
        "description": "feat3",
        "type": "feature",
        "feature_type": "float",
        "units": "feat3",
        "units_description": "",
        "qualifies": [],
        "qualifierrole": "breakdown",
        "aliases": {}
      },
      {
        "name": "d_flood",
        "display_name": "d_flood",
        "description": "feat4",
        "type": "feature",
        "feature_type": "float",
        "units": "feat4",
        "units_description": "",
        "qualifies": [],
        "qualifierrole": "breakdown",
        "aliases": {}
      }
    ]
  }
}
"""
)

class NodeInput(TypedDict):
    data_source: str
    geo_aggregation_function: str
    time_aggregation_function: str

class NodeData(TypedDict):
    label: str
    input: NodeInput

class Node(TypedDict):
    type: str
    data: NodeData
    id: str

class Edge(TypedDict):
    source: str
    target: str
    id: str

class Resolution(TypedDict):
    geoResolutionColumn: str
    timeResolutionColumn: str

class Graph(TypedDict):
    nodes: list[Node]
    edges: list[Edge]
    resolution: Resolution

class FlowcastContext(TypedDict):
    dag: Graph



def get_node_parents(node_id: str, graph: Graph, num_expected:int=None) -> list[str]:
    parents = [edge['source'] for edge in graph['edges'] if edge['target'] == node_id]
    if num_expected is not None:
        assert len(parents) == num_expected, f'Node {node_id} has incorrect number of parents: {parents}. Expected {num_expected}.'
    return parents


def topological_sort(graph: Graph):
    nodes = {node['id']: node for node in graph['nodes']}
    edges = [(edge['source'], edge['target']) for edge in graph['edges']]
    
    in_degree = defaultdict(int)

    for _, target in edges:
        in_degree[target] += 1

    # Create a queue and enqueue all nodes with in-degree 0
    queue = deque([node_id for node_id in nodes if in_degree[node_id] == 0])

    result = []
    p = Pipeline()
    seen = set() # keep track of nodes that have been visited

    while queue:
        current = queue.popleft()
        assert current not in seen, "Graph is not a DAG"
        seen.add(current)
        result.append(nodes[current])

        for src, tgt in edges:
            if src == current:
                in_degree[tgt] -= 1
                if in_degree[tgt] == 0:
                    queue.append(tgt)

    # update the graph with the sorted nodes
    graph['nodes'] = result



def get_data(features:list[NodeInput]):
    """
    Given a list of data ids and feature names:
    - download the netcdf files and headers/annotations from elasticsearch
    - create a dataloader function for each feature
    - return a map from feature_name::data_id to dataloader
    """
    #TODO: collect netcdfs and headers from elasticsearch

    datasets:dict[str, xr.Dataset] = {}            #map from dataset_id to xr.Dataset
    annotations:dict[str, dict] = {}               #map from dataset_id to annotation
    loaders:dict[str, Callable[[], Variable]] = {} #map from variable_name::dataset_id to dataloader for that variable

    #collect all mentioned datasets and corresponding annotations
    dataset_ids = set(feature['data_source'].split('::')[1] for feature in features)
    for dataset_id in dataset_ids:
        # download netcdf from ES
        # grab annotation from endpoint
        # datasets[dataset_id] = xr.open_dataset(...)
        # annotations[dataset_id] = ...
        pdb.set_trace()

    #create loaders for each variable
    for feature in features:
        data_source = feature['data_source']
        dataset_id, variable_name = data_source.split('::')
        
        feature = datasets[dataset_id]#[variable_name]
        annotation = annotations[dataset_id]
        #TODO: convert coordinate names based on annotation to match those expected by the pipeline (time, lat, lon)
        pdb.set_trace()
        
        time_regrid_type = RegridType[feature.attrs['time_regrid_type']]
        geo_regrid_type = RegridType[feature.attrs['geo_regrid_type']]
        loaders[data_source] = lambda: Variable(feature, time_regrid_type, geo_regrid_type)



    # clean up downloaded netcdfs
    for dataset_id in dataset_ids:
        # delete netcdf
        pdb.set_trace()
        ...

    

    return loaders


def run_flowcast_job(context:FlowcastContext):
    graph = context['dag']
    topological_sort(graph)


    # Create data loaders for each load node
    features = [node['data']['input'] for node in graph['nodes'] if node['type'] == 'load']
    loaders = get_data(features)

    # create the pipeline
    pipe = Pipeline()

    # keep track of save nodes which need to be fed back into dojo (TODO)
    saved_nodes: list[tuple[str, str]] = [] #list[(node_id, name)]

    # insert each step into the pipeline
    for node in graph['nodes']:
        
        if node['type'] == 'load':
            pipe.load(node['id'], loaders[node['data']['input']['data_source']])
            
        elif node['type'] == 'threshold':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            pipe.threshold(node['id'], parent, Threshold(float(node['data']['input']['value']), ThresholdType[node['data']['input']['type']]))
            
        elif node['type'] == 'multiply':
            left, right = get_node_parents(node['id'], graph, num_expected=2)
            pipe.multiply(node['id'], left, right)
                
        #TODO: needs some updates to expected payload
        # elif node['type'] == 'sum':
        #     parent, = get_node_parents(node['id'], graph, num_expected=1)
        #     #TODO: ideally pull this information from a canonical list from flowcast...
        #     dims = [dim for dim in  ['lat', 'lon', 'time', 'country', 'scenario', 'realization'] if node['data']['input'][dim]]
        #     pipe.sum_reduce(node['id'], parent, dims)
            
        elif node['type'] == 'save':
            parent, = get_node_parents(node['id'], graph, num_expected=1)

            # skip pipeline built-in saving
            saved_nodes.append((parent, node['data']['input']))
            
        #TODO: handling other node types
        
        raise NotImplementedError(f'Parsing of node type {node["type"]} not implemented.')


    # run the pipeline
    pipe.execute()

    #TODO: dealing with output files
    for node_id, name in saved_nodes:
        todo = pipe.get_value(node_id).data
        print(f'do something with {name} = {todo}')



if __name__ == "__main__":
    run_flowcast_job(context={'dag':example_flowcast})