from __future__ import annotations

from elasticsearch import Elasticsearch
from settings import settings
from utils import get_rawfile
from api.validation.MetadataSchema import MetaModel, AnnotationSchema, GeoAnnotation, DateAnnotation

es_url = settings.ELASTICSEARCH_URL
es = Elasticsearch(es_url)

import os
import shutil
import requests
import xarray as xr
from flowcast.pipeline import Pipeline, Variable, Threshold, ThresholdType
from flowcast.spacetime import Frequency, Resolution
from flowcast.regrid import RegridType
from collections import defaultdict, deque
from typing import TypedDict, Callable



# Type Specification for flowcast DAG payload
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

class DagResolution(TypedDict):
    geoResolutionColumn: str
    timeResolutionColumn: str

class Graph(TypedDict):
    nodes: list[Node]
    edges: list[Edge]
    resolution: DagResolution

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
    loaders:dict[str, Callable[[], Variable]] = {} #map from variable_name::dataset_id to dataloader for that variable

    # create temporary directory for storing netcdfs
    tmpdir = './tmp_netcdf'
    filename = 'raw_data.nc'
    
    #collect all mentioned datasets and corresponding annotations
    dataset_ids = set(feature['data_source'].split('::')[1] for feature in features)
    for dataset_id in dataset_ids:
        # download netcdf from ES
        rawfile_path = os.path.join(settings.DATASET_STORAGE_BASE_URL, dataset_id, filename)
        file_path = os.path.join(tmpdir, f'{dataset_id}_{filename}')

        raw_file_obj = get_rawfile(rawfile_path)
        with open(file_path, "wb") as f:
            f.write(raw_file_obj.read())
        
        # grab annotation from endpoint
        metadata_path = os.path.join(settings.DOJO_URL, 'indicators', dataset_id, 'annotations')
        metadata: MetaModel = requests.get(metadata_path).json()

        # collect the time and geo annotations from the metadata
        annotations: AnnotationSchema = metadata['annotations']
        geo_annotations: list[GeoAnnotation] = annotations['geo']
        time_annotations: list[DateAnnotation] = annotations['date']
        assert len(geo_annotations) == 2, f'Expected 2 geo annotations (for latitude/longitude), got {len(geo_annotations)}: {geo_annotations=}'
        assert len(time_annotations) == 1, f'Expected 1 time annotation, got {len(time_annotations)}: {time_annotations=}'
        time_annotation, = filter(lambda a: a['date_type'] == 'date', time_annotations)
        lat_annotation, = filter(lambda a: a['geo_type'] == 'latitude', geo_annotations)
        lon_annotation, = filter(lambda a: a['geo_type'] == 'longitude', geo_annotations)

        # load the netcdf and convert coordinate names to time, lat, lon
        dataset = xr.open_dataset(file_path)
        dataset = dataset.rename({time_annotation['name']: 'time', lat_annotation['name']: 'lat', lon_annotation['name']: 'lon'})

        # store dataset in map
        datasets[dataset_id] = dataset


    #create loaders for each variable
    for feature in features:
        data_source = feature['data_source']
        dataset_id, variable_name = data_source.split('::')
        
        feature = datasets[dataset_id][variable_name]
        
        time_regrid_type = RegridType[feature.attrs['time_regrid_type']]
        geo_regrid_type = RegridType[feature.attrs['geo_regrid_type']]
        loaders[data_source] = lambda: Variable(feature, time_regrid_type, geo_regrid_type)

    # clean up downloaded netcdfs
    shutil.rmtree(tmpdir)

    return loaders


def run_flowcast_job(context:FlowcastContext):
    graph = context['dag']
    topological_sort(graph)


    # Create data loaders for each load node
    features = [node['data']['input'] for node in graph['nodes'] if node['type'] == 'load']
    loaders = get_data(features)

    # create the pipeline
    pipe = Pipeline()

    # set the targeted geo resolution of the pipeline
    if '::' in graph['resolution']['geoResolutionColumn']:
        # get the load node that corresponds to the geo resolution
        node, = filter(lambda node: node['type'] == 'load' and node['data']['input']['data_source'] == graph['resolution']['geoResolutionColumn'], graph['nodes'])
        pipe.set_geo_resolution(node['id'])
    else:
        lat,lon = graph['resolution']['geoResolutionColumn'].split(',')
        pipe.set_geo_resolution(Resolution(float(lat), float(lon)))
    
    # set the targeted time resolution of the pipeline
    if '::' in graph['resolution']['timeResolutionColumn']:
        # get the load node that corresponds to the time resolution
        node, = filter(lambda node: node['type'] == 'load' and node['data']['input']['data_source'] == graph['resolution']['timeResolutionColumn'], graph['nodes'])
        pipe.set_time_resolution(node['id'])
    else:
        freq = Frequency[graph['resolution']['timeResolutionColumn']]
        pipe.set_time_resolution(freq)


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