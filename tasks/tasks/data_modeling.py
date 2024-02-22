from __future__ import annotations

from elasticsearch import Elasticsearch
from settings import settings
from utils import get_rawfile
# from api.validation.MetadataSchema import MetaModel, AnnotationSchema, GeoAnnotation, DateAnnotation

import os
import json
import shutil
from pathlib import Path
import requests
import xarray as xr
import pandas as pd
import numpy as np
from cftime import DatetimeNoLeap, DatetimeGregorian
from flowcast.pipeline import Pipeline, Variable, Threshold, ThresholdType
from flowcast.spacetime import Frequency, Resolution
from flowcast.regrid import RegridType
from collections import defaultdict, deque
from typing import Callable, Union, List
from pydantic import BaseModel, Field


# ###### DEBUG ######
# import pdb
# from data_modeling_debug_helpers import plot_to_web
# from matplotlib import pyplot as plt
# plt.show = plot_to_web


# import logging
# logging.basicConfig()
# logging.getLogger().setLevel(logging.INFO)

es_url = settings.ELASTICSEARCH_URL
es = Elasticsearch(es_url)





# Type Specification for flowcast DAG payload
class LoadNode(BaseModel):
    data_source: str = Field(..., description='The data source to load. Format: <feature_name>::<dataset_id>', example='d_flood::8987a98e-4128-4602-9f72-e3efa1b53668')
    geo_aggregation_function: str = Field(..., description='The aggregation function to use for geo resolution. Options: conserve, min, max, mean, median, mode, interp_or_mean, nearest_or_mode', example='min')
    time_aggregation_function: str = Field(..., description='The aggregation function to use for time resolution. Options: conserve, min, max, mean, median, mode, interp_or_mean, nearest_or_mode', example='median')

class ThresholdNode(BaseModel):
    value: str = Field(..., description='The threshold value', example='12')
    type: str = Field(..., description='The threshold type. Options: greater_than, greater_than_or_equal, less_than, less_than_or_equal, equal, not_equal', example='greater_than')

class NodeData(BaseModel):
    label: str = Field(..., description='The label of node (just repeats the node type)', example='load')
    input: Union[LoadNode,ThresholdNode,str,None] = Field(..., description='Any settings for the node. Shape depends on the node type', example={'data_source': 'd_flood::8987a98e-4128-4602-9f72-e3efa1b53668', 'geo_aggregation_function': 'min', 'time_aggregation_function': 'median'})
            # SaveNode's input is just a string
            # MultiplyNode doesn't have any input

class Node(BaseModel):
    type: str = Field(..., description='The type of node. Options: load, threshold, save, multiply', example='load')
    data: NodeData = Field(..., description='The data of the node. Shape depends on the node type', example={'label': 'load', 'input': {'data_source': 'd_flood::8987a98e-4128-4602-9f72-e3efa1b53668', 'geo_aggregation_function': 'min', 'time_aggregation_function': 'median'}})
    id: str = Field(..., description='The unique id of the node in the graph', example='n_90d60ae6-a0d1-4fb7-960e-640843bff138')

class Edge(BaseModel):
    source: str = Field(..., description='The id of the source node', example='n_90d60ae6-a0d1-4fb7-960e-640843bff138')
    target: str = Field(..., description='The id of the target node', example='n_156a6819-b768-45ee-bceb-1e7c7c96bf03')
    id: str = Field(..., description='The unique id of the edge in the graph', example='reactflow__edge-n_90d60ae6-a0d1-4fb7-960e-640843bff138-n_156a6819-b768-45ee-bceb-1e7c7c96bf03')

class DagResolution(BaseModel):
    geoResolutionColumn: str = Field(..., description='Either the name of a load node (<feature_name>::<dataset_id>) or a pair of lat/lon deltas, or a single value for a square grid delta', example='0.25,0.25')
    timeResolutionColumn: str = Field(..., description='Either the name of a load node (<feature_name>::<dataset_id>) or a time frequency. Options: monthly, yearly, decadal', example='monthly')

class Graph(BaseModel):
    nodes: List[Node] = Field(..., description='The nodes in the graph')
    edges: List[Edge] = Field(..., description='The edges in the graph')
    resolution: DagResolution = Field(..., description='The targeted geo and temporal resolutions of the graph')

class FlowcastContext(BaseModel):
    dag: Graph = Field(..., description='The flowcast DAG to run')






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



def prepare_netcdf(file_path: Path, time_annotation, lat_annotation, lon_annotation) -> xr.Dataset:
    # load the netcdf and convert coordinate names to time, lat, lon
    dataset: xr.Dataset = xr.open_dataset(file_path)
    if time_annotation['name'] in dataset.coords:
        dataset = dataset.rename({time_annotation['name']: 'time'})
    if lat_annotation['name'] in dataset.coords:
        dataset = dataset.rename({lat_annotation['name']: 'lat'})
    if lon_annotation['name'] in dataset.coords:
        dataset = dataset.rename({lon_annotation['name']: 'lon'})

    # ensure the time dimension is of type cftime.DatetimeNoLeap
    if 'time' in dataset.coords:
        if isinstance(dataset['time'].values[0], str):
            # time_annotation['time_format'] # e.g. '%Y-%m-%d %H:%M:%S'
            times = [pd.to_datetime(t, format=time_annotation['time_format']) for t in dataset['time'].values]
            times = [DatetimeNoLeap(t.year, t.month, t.day, t.hour, t.minute, t.second) for t in times]
            dataset['time'] = times
        elif isinstance(dataset['time'].values[0], DatetimeNoLeap):
            pass
        elif isinstance(dataset['time'].values[0], np.datetime64):
            def to_cftime(t: np.datetime64) -> DatetimeNoLeap:
                dt = pd.to_datetime(t)
                return DatetimeNoLeap(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)
            times = [to_cftime(t) for t in dataset['time'].values]
            dataset['time'] = times
        else:
            raise Exception('unhandled time type', type(dataset['time'].values[0]))
        
    return dataset

def prepare_geotiff(file_path:Path, features_annotations) -> xr.Dataset:
    
    dataset: xr.Dataset = xr.open_dataset(file_path)
    
    
    assert 'x' in dataset.coords and 'y' in dataset.coords, f'Expected x and y coordinates in geotiff, got {dataset.coords=}'
    #TODO: handling different coordinate systems that are not lat/lon. E.g. UTM
    dataset = dataset.rename({'x': 'lon'})
    dataset = dataset.rename({'y': 'lat'})

    if 'time' in dataset.coords:
        #ensure time is converted to cftime.DatetimeNoLeap
        if isinstance(dataset['time'].values[0], DatetimeGregorian):
            times = [DatetimeNoLeap(t.year, t.month, t.day, t.hour, t.minute, t.second) for t in dataset['time'].values]
            dataset['time'] = times
        elif isinstance(dataset['time'].values[0], DatetimeNoLeap):
            pass
        else:
            raise Exception('unhandled time type', type(dataset['time'].values[0]))

    
    if 'band' in dataset.coords:
        assert 'band_data' in dataset.data_vars, f'Expected band_data variable in geotiff, got {dataset.data_vars=}'
        assert len(features_annotations) == dataset['band'].shape[0], f'Expected {dataset["band"].shape[0]} feature annotations, got {len(features_annotations)}: {features_annotations=}'

        # break each band into a separate feature
        dataset = xr.Dataset({
            feature_annotations['name']: dataset.isel(band=idx, drop=True)['band_data']
            for idx, feature_annotations in enumerate(features_annotations)
        })

    else:
        #convert main column name to the feature name
        assert len(features_annotations) == 1, f'Expected 1 feature annotation, got {len(features_annotations)}: {features_annotations=}'
        feature_annotation, = features_annotations
        data_vars = [*dataset.data_vars]
        assert len(data_vars) == 1, f'Expected 1 data variable, got {len(data_vars)}: {data_vars=}'
        data_var, = data_vars
        dataset = dataset.rename({data_var: feature_annotation['name']})
    
    return dataset


def get_data(features:list[LoadNode]):
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
    tmpdir = Path('./tmp_netcdf')
    # filename = 'raw_data.nc'
    if not os.path.exists(tmpdir):
        os.mkdir(tmpdir)

    
    #collect all mentioned datasets and corresponding annotations
    dataset_ids: set[str] = set(feature['data_source'].split('::')[1] for feature in features)
    for dataset_id in dataset_ids:
        # grab annotation from endpoint
        metadata_path = os.path.join(settings.DOJO_URL, 'indicators', dataset_id, 'annotations')
        metadata = requests.get(metadata_path).json()
        
        # filedata = requests.get(os.path.join(settings.DOJO_URL, 'indicators', dataset_id, 'file_data')).json()
        alldata = requests.get(os.path.join(settings.DOJO_URL, 'indicators', dataset_id)).json()
        filedata = alldata['fileData']
        raw_filename: str = filedata['raw']['rawFileName']

        # download netcdf from ES
        rawfile_url = os.path.join(settings.DATASET_STORAGE_BASE_URL, dataset_id, raw_filename)
        file_path = tmpdir / f'{dataset_id}_{raw_filename}'

        raw_file_obj = get_rawfile(rawfile_url)
        with open(file_path, "wb") as f:
            f.write(raw_file_obj.read())
        
        # collect the time and geo annotations from the metadata
        annotations = metadata['annotations']
        geo_annotations: list = annotations['geo']
        time_annotations: list = annotations['date']
        assert len(geo_annotations) == 2, f'Expected 2 geo annotations (for latitude/longitude), got {len(geo_annotations)}: {geo_annotations=}'
        assert len(time_annotations) == 1, f'Expected 1 time annotation, got {len(time_annotations)}: {time_annotations=}'
        time_annotation, = filter(lambda a: a['date_type'] == 'date', time_annotations)
        lat_annotation, = filter(lambda a: a['geo_type'] == 'latitude', geo_annotations)
        lon_annotation, = filter(lambda a: a['geo_type'] == 'longitude', geo_annotations)

        if raw_filename.endswith('.nc'):
            dataset = prepare_netcdf(file_path, time_annotation, lat_annotation, lon_annotation)
        elif raw_filename.endswith('.tif') or raw_filename.endswith('.tiff'):
            features_annotations = annotations['feature']
            dataset = prepare_geotiff(file_path, features_annotations)
        else:
            raise Exception(f'Unsupported file type: {raw_filename}')

        # store dataset in map
        datasets[dataset_id] = dataset

    #create loaders for each variable
    for feature in features:
        data_source = feature['data_source']
        variable_name, dataset_id = data_source.split('::')
        data = datasets[dataset_id][variable_name]
        time_regrid_type = RegridType[feature['time_aggregation_function']]
        geo_regrid_type = RegridType[feature['geo_aggregation_function']]
        
        # outer lambda is to make sure the inner lambda captures the values from the current iteration of the loop
        # without, the lambda would lazily capture the value, and all of them would end up with the last value
        loader = lambda data, time_regrid_type, geo_regrid_type: lambda: Variable(data, time_regrid_type, geo_regrid_type)
        loaders[data_source] = loader(data, time_regrid_type, geo_regrid_type)

    # clean up downloaded netcdfs
    shutil.rmtree(tmpdir)

    return loaders

dtype_kind_map = {
    'b': 'bool',
    'i': 'int',
    'u': 'int',
    'f': 'float',
}

def post_data_to_dojo(data: xr.Dataset, name: str, dataset_description:str, feature_description:str):
    print(f'######### Saving to dojo:\n{name}\n{dataset_description}\n{feature_description}\n{data}\n#########')
    #create indicator
    metadata = {
        "name": name,
        "description": dataset_description,
        "domains": ["Logic"],
        "maintainer": {
            "name": "TODO: who derived the dataset",
            "email": "todo@jataware2.com",
            "organization": "Jataware2",
            "website": "jataware.com"
        },
        "file_metadata": {
            "filetype": "nc"
        },
        #TODO: this probably isn't the right way to set the filedata stuff 
        # it looks like the endpoint is supposed to be setting it, but that wasn't working, while hardcoding it here did
        "fileData": {
            "raw": {
                "uploaded": True,
                "url": "data.nc",
                "rawFileName": "raw_data.nc"
            }
        }
    }
    
    #get datatype of data
    datatype = dtype_kind_map[data.data.dtype.kind]

    latlon_primary = 'Y' if 'admin0' not in data.coords else ''
    
    #create annotation
    column_names=[
        'field_name',   'group',        'display_name', 'description',      'data_type',    'units',    'units_description',    'primary',  'date_format',      'gadm_level',   'resolve_to_gadm',  'coord_format', 'qualifies',    'qualifier_role']
    
    rows = [
        [name,          '',             name,           feature_description, datatype,      'todo',     'figure out units',     '',             '',                 '',             '',                 '',             '',             ''] 
    ]
    if 'time' in data.coords: rows.append(
        ['time',        'main_date',    'Date',         'time coordinates', 'date',         '',         '',                     'Y',            '%Y-%m-%d %H:%M:%S','',             '',                 '',             '',             '']
    )
    if 'lat' in data.coords: rows.append(
        ['lat',         'latlonpair',   'Latitude',     'geo coordinates',  'latitude',     '',         '',                     latlon_primary, '',                 'admin1',       '',                 '',             '',             ''],
    )
    if 'lon' in data.coords: rows.append(
        ['lon',         'latlonpair',   'Longitude',    'geo coordinates',  'longitude',    '',         '',                     latlon_primary, '',                 'admin1',       '',                 '',             '',             ''],
    )
    if 'admin0' in data.coords: rows.append(
        ['admin0',      'main_geo',     'Country',      'gadm level 0',     'admin0',       '',         '',                     'Y',            '',                 'admin0',       '',                 '',             '',             ''],
    )
    dictionary = pd.DataFrame(rows, columns=column_names)

    
    #convert data to netcdf bytes
    dataset = xr.Dataset({name: data})
    dataset.to_netcdf('data.nc')
    with open('data.nc', 'rb') as f:
        data_bytes = f.read()
    os.remove('data.nc')

    
    #make post request
    # e.g. as a curl command:
    # curl -v -F "metadata=@metadata.json" -F "data=@data.csv" -F "dictionary=@dictionary.csv" http://localhost:8000/indicators/register
    response = requests.post(f'{settings.DOJO_URL}/indicators/register', files={
        'metadata': ('metadata.json', json.dumps(metadata), 'application/json'),
        'data': ('data.nc', data_bytes, 'application/octet-stream'),
        'dictionary': ('dictionary.csv', dictionary.to_csv(), 'text/csv')
    })
    
    return response.json()

def run_flowcast_job(context:FlowcastContext) -> dict:
    try:
        return unhandled_run_flowcast_job(context)
    except Exception as e:
        # print exception with stack trace
        import traceback
        traceback.print_exc()
        print(f'Flowcast job failed', flush=True)
        return {
            'message': 'error running flowcast job',
            'error': str(e)
        }

def unhandled_run_flowcast_job(context:FlowcastContext) -> dict:
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
    elif ',' in graph['resolution']['geoResolutionColumn']:
        lat,lon = graph['resolution']['geoResolutionColumn'].split(',')
        pipe.set_geo_resolution(Resolution(float(lat), float(lon)))
    else:
        res = graph['resolution']['geoResolutionColumn']
        pipe.set_geo_resolution(Resolution(float(res)))
    
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
        print(f'Processing node {node["id"]} of type {node["type"]}')
        if node['type'] == 'load':
            pipe.load(node['id'], loaders[node['data']['input']['data_source']])
            
        elif node['type'] == 'threshold':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            preserve_nan = node['data']['input']['preserve_nan']
            value = node['data']['input']['value']
            threshold_type = ThresholdType[node['data']['input']['type']]
            if '%' in value:
                raise NotImplementedError('Percentile thresholds are not yet supported')
                value = float(value.strip('%')) / 100
            else:
                value = float(value)
            pipe.threshold(node['id'], parent, Threshold(float(value), ThresholdType[threshold_type]), preserve_nan=preserve_nan)
            
        elif node['type'] == 'multiply': #TODO: rename this from "multiply" to "join"
            left, right = get_node_parents(node['id'], graph, num_expected=2)
            op = node['data']['input']
            if op == 'add':
                pipe.add(node['id'], left, right)
            elif op == 'subtract':
                pipe.subtract(node['id'], left, right)
            elif op == 'multiply':
                pipe.multiply(node['id'], left, right)
            elif op == 'divide':
                pipe.divide(node['id'], left, right)
            elif op == 'power':
                pipe.power(node['id'], left, right)
            else:
                raise Exception(f'Unsupported operation `{op}` for join node. Only supported operations are `add`, `subtract`, `multiply`, `divide`, and `power`.')
                

        elif node['type'] == 'sum': #rename to sum_reduce
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            aggregation = node['data']['input']['aggregation']
            del node['data']['input']['aggregation']
            dim_map:dict[str,bool] = node['data']['input']

            # verify that only supported dimensions are selected
            for dim, selected in dim_map.items():
                if selected and dim not in ['time', 'lat', 'lon', 'country']:
                    raise Exception(f'Unsupported dimension `{dim}` selected for group by node. Only supported dimensions are `time`, `lat`, `lon`, and `country`.')

            #rename country to admin0 if present
            if 'country' in dim_map:
                dim_map['admin0'] = dim_map['country']
                del dim_map['country']

            dims = [dim for dim,present in dim_map.items() if present]
            if aggregation == 'sum':
                pipe.sum_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'mean':
                pipe.mean_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'median':
                pipe.median_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'max':
                pipe.max_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'min':
                pipe.min_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'standard_deviation':
                pipe.std_reduce(node['id'], parent, dims=dims)
            elif aggregation == 'mode':
                pipe.mode_reduce(node['id'], parent, dims=dims)
            else:
                raise Exception(f'Unsupported aggregation `{aggregation}` for reduce_by node. Only supported aggregations are `sum`, `mean`, `median`, `max`, `min`, `standard_deviation`, and `mode`.')


        elif node['type'] == 'save':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            outname = node['data']['input']
            # pipe.save(parent, outname) #just use the in memory data for making the post request

            # keep track of save nodes
            saved_nodes.append((parent, outname))


        elif node['type'] == 'filter_by_country':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            countries = node['data']['input']
            pipe.reverse_geocode(node['id'], parent, places=countries, admin_level=0)


        elif node['type'] == 'scalar_operation':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            op = node['data']['input']['operation']
            value_str = node['data']['input']['value']
            value = float(value_str)
            try: # if value can be narrowed to int, do so
                value = int(value_str)
            except ValueError:
                pass
            
            if op == 'add':
                pipe.scalar_add(node['id'], parent, value)
            elif op == 'subtract':
                pipe.scalar_subtract(node['id'], parent, value)
            elif op == 'multiply':
                pipe.scalar_multiply(node['id'], parent, value)
            elif op == 'divide':
                divide_position = node['data']['input']['scalar_position_divide']
                assert divide_position in ['numerator', 'denominator'], f'Invalid divide position: {divide_position}'
                pipe.scalar_divide(node['id'], parent, value, divide_position)
            elif op == 'power':
                power_position = node['data']['input']['scalar_position_power']
                assert power_position in ['base', 'exponent'], f'Invalid power position: {power_position}'
                pipe.scalar_power(node['id'], parent, value, power_position)
            else:
                raise Exception(f'Unsupported operation `{op}` for scalar_operation node. Only supported operations are `add`, `subtract`, `multiply`, `divide`, and `power`.')


        elif node['type'] == 'mask_to_distance_field':
            parent, = get_node_parents(node['id'], graph, num_expected=1)
            include_initial_points = node['data']['input']['include_initial_points']
            pipe.mask_to_distance_field(node['id'], parent, include_initial_points=include_initial_points)


        elif node['type'] == 'select_slice':
            def to_int_or_slice(index_str:str) -> int|slice:
                if ':' in index_str:
                    start,stop = index_str.split(':')
                    start = int(start.strip())
                    stop = int(stop.strip())
                    return slice(start, stop)
                return int(index_str.strip())

            def to_index(index_str:str) -> int|slice|np.ndarray:
                chunks = index_str.split(',')
                if len(chunks) == 1:
                    return to_int_or_slice(chunks[0])

                index = []
                for chunk in chunks:
                    i = to_int_or_slice(chunk)
                    if isinstance(i, int):
                        index.append(i)
                    else:
                        index.extend(range(i.start, i.stop))

                return np.array(index)

            parent, = get_node_parents(node['id'], graph, num_expected=1)
            indexers = { chunk['dimension']: to_index(chunk['index']) for chunk in node['data']['input'] }
            pipe.isel(node['id'], parent, indexers, drop=True)


        #TODO: handling other node types
        else:
            print(f'unhandled node: {node}', flush=True)
            raise NotImplementedError(f'Parsing of node type {node["type"]} not implemented.')


    # run the pipeline
    pipe.execute()

    #TODO: dealing with output files
    results = []
    for node_id, save_props in saved_nodes:
        data = pipe.get_value(node_id).data
        parent_datasets_str = '- ' + '\n- '.join(loaders.keys())
        name = save_props['name']
        feature_description = save_props['description']
        results.append(post_data_to_dojo(
            data,
            name,
            dataset_description=f"Derived dataset generated via Dojo Data Modeling process.\nParent Dataset Features:\n{parent_datasets_str}",
            feature_description=feature_description
        ))


    # result object
    result = {
        'message': 'successfully ran flowcast job',
        'output-files': [name for _,name in saved_nodes],
        'results': results
    }

    return result