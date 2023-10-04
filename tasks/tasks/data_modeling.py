from __future__ import annotations

# from elasticsearch import Elasticsearch
# from settings import settings


# es_url = settings.ELASTICSEARCH_URL
# es = Elasticsearch(es_url)
import xarray as xr
from flowcast.pipeline import Pipeline, Variable
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
        if current in seen:
            raise ValueError("Graph is not a DAG")
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


    # get the list of features to load
    features = [node['data']['input'] for node in graph['nodes'] if node['type'] == 'load']
    pdb.set_trace()

    loaders = get_data(features)
    #run the pipeline
    #create loader functions for each dataset/variable (or do as they are loaded by the graph?)
    pdb.set_trace()
    ...

    #TODO: dealing with output files



if __name__ == "__main__":
    run_flowcast_job(context={'dag':example_flowcast})