from __future__ import annotations

from typing import Protocol, TypedDict, Callable
import numpy as np
import xarray as xr
from matplotlib import pyplot as plt
import base64
from io import BytesIO
from cartopy import crs as ccrs
from cartopy import feature as cfeature
import pandas as pd
import geopandas as gpd
import matplotlib.cm as cm
from flowcast.gadm import get_admin0_shapes
from flowcast.spacetime import determine_tight_lon_bounds
from shapely import MultiPolygon, Polygon


# TODO: this is a bit hacky. in the future, want to import the underlying methods used in the pipeline rather than having to run a whole pipeline
from flowcast.pipeline import Pipeline, Variable


def symmetric_log(data: xr.DataArray) -> xr.DataArray:
    """Apply a symmetric log transform to the data"""
    if (data.dtype == np.bool_):
        return data
    return np.sign(data) * np.log(np.abs(data) + 1)


def get_px_size() -> float:
    return 1/plt.rcParams['figure.dpi']  # pixel in inches


class ProjType:
    # TODO: too many bugs for mollweide need to fix/work around
    # there's a bug when central_longitude is smaller than 1
    # there's a bug when setting ax.set_extent to -180, 180 for longitude, it only shows half the world
    # mollweide = ccrs.Mollweide(central_longitude=1)
    robinson = ccrs.Robinson()


png64 = str


def save_fig_to_base64() -> png64:
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close()
    return base64.b64encode(buf.getvalue()).decode('utf-8')


class PreviewGenerator(Protocol):
    def __call__(self, data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64: ...


class DualPreviewGenerator(Protocol):
    def __call__(self, data: xr.DataArray, resolution: int, cmap: str,
                 projection: ccrs.Projection) -> tuple[png64, png64]: ...


class SlicedDualPreviewGenerator(Protocol):
    def __call__(self, data: xr.DataArray, resolution: int, cmap: str,
                 projection: ccrs.Projection) -> tuple[list[png64], list[png64]]: ...


def make_dual(fn: PreviewGenerator) -> DualPreviewGenerator:
    def generate_img(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> tuple[png64, png64]:
        return fn(data, resolution, cmap, projection), fn(symmetric_log(data), resolution, cmap, projection)
    return generate_img


def make_sliced(fn: DualPreviewGenerator, max_images: int = 5) -> SlicedDualPreviewGenerator:
    def generate_img(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> tuple[list[png64], list[png64]]:
        # handle when time is not present in the data by returning a list of one
        contains_time = 'time' in data.dims and len(data['time'].shape) > 0 and len(data['time']) > 1
        if not contains_time or len(data.dims) <= 1:
            img, log_img = fn(data, resolution, cmap, projection)
            return ([img], [log_img])

        # generate a sequence of images by slicing along the time dimension
        indices = np.unique(np.linspace(0, len(data['time']) - 1, max_images, dtype=int))
        frames = [add_timestamp_to_image(data.isel(time=i), fn, resolution, cmap, projection, data['time'].values[i]) for i in indices]
        return tuple(zip(*frames))

    return generate_img


class PreviewData(TypedDict):
    shape: tuple[int, ...]
    dtype: str
    dims: list[str]
    has_NaN: bool
    preview: list[png64]
    log_preview: list[png64]


def generate_preview(data: xr.DataArray, resolution=512, cmap='viridis', projection: ccrs.Projection = ProjType.robinson) -> PreviewData:
    """Generate a preview of the data for the frontend"""

    # different cases for data with different dimensions
    coords_set = set(data.coords)
    coords_set.discard('time')

    def make_sliced_dual(fn: PreviewGenerator): return make_sliced(make_dual(fn))

    # TODO: would like to turn this into a dict[tuple[str, ...], SlicedDualPreviewGenerator] mapping from coords to fn
    fn: SlicedDualPreviewGenerator
    if len(coords_set) == 0:
        fn = make_sliced_dual(generate_time_preview)
    elif coords_set == {'lat'}:
        fn = make_sliced_dual(generate_lat_preview)
    elif coords_set == {'lon'}:
        fn = make_sliced_dual(generate_lon_preview)
    elif coords_set == {'admin0'}:
        fn = make_sliced_dual(generate_country_preview)
    elif coords_set == {'lat', 'lon'}:
        fn = make_sliced_dual(generate_lat_lon_preview)
    elif coords_set == {'lat', 'admin0'}:
        fn = generate_lat_country_preview
    elif coords_set == {'lon', 'admin0'}:
        fn = generate_lon_country_preview
    elif coords_set == {'lat', 'lon', 'admin0'}:
        fn = make_sliced_dual(generate_country_lat_lon_preview)

    else:
        # raise ValueError(f'Unhandled data dimensions: {data.dims}')
        print(f'Unhandled data dimensions: {data.dims}, coords_set={coords_set}')
        fn = make_sliced_dual(generate_missing_image)

    # generate the previews and log previews
    previews, log_previews = fn(data, resolution, cmap, projection)

    preview: PreviewData = {
        'shape': data.shape,
        'dtype': str(data.dtype),
        'dims': list(data.dims),
        'has_NaN': data.isnull().any().item(),
        'preview': previews,
        'log_preview': log_previews
    }
    return preview


def generate_lat_lon_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:
    """Generate a base64 image preview of the given data array containing only lat and lon dimensions"""
    data = data.expand_dims(admin0=['Earth'])
    return generate_country_lat_lon_preview(data, resolution, cmap, projection)


def generate_time_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:
    """just use the built-in xarray plot method"""
    px = get_px_size()

    # regular plot
    fig, ax = plt.subplots(figsize=(resolution*px, resolution*px))
    ax.axis('off')
    data.plot(ax=ax)
    preview = save_fig_to_base64()

    return preview


def get_best_view(lats: np.ndarray, lons: np.ndarray, projection: ccrs.Projection, threshold=0.65) -> tuple[tuple[float, float], tuple[float, float], ccrs.Projection, float]:
    """
    Determine the best view of the data on a globe given the latitude and longitude bounds.

    Args:
    - lats: A numpy array of all latitudes for the data (may be unsorted)
    - lons: A numpy array of all longitudes for the data (may be unsorted)
    - projection: The projection to use for the plot
    - threshold: A % threshold to determine when view should snap to global bounds. If view fraction taken up by the data on some axis is more than this, then min/max bounds will be used

    Returns:
    - A tuple of (lat_bounds, lon_bounds, projection, aspect_ratio)
    """

    # determine latitude bounds (easy)
    lat_min, lat_max = lats.min(), lats.max()
    lat_fraction = (lat_max - lat_min) / 180
    lat_bounds = (lat_min, lat_max) if lat_fraction < threshold else (-90, 90)

    # determine longitude bounds (not easy 😂)
    lon_min, lon_max = determine_tight_lon_bounds(lons)
    lon_center = (lon_min + lon_max) / 2
    lon_fraction = (lon_max - lon_min) / 360
    lon_bounds = (lon_min, lon_max) if lon_fraction < threshold else (-180, 180)
    central_longitude = lon_center if lon_fraction < threshold else 0

    # adjust projection
    projection = type(projection)(central_longitude=central_longitude)

    # calculate aspect ratio
    aspect = np.abs((lon_bounds[1] - lon_bounds[0]) / (lat_bounds[1] - lat_bounds[0]))

    return lat_bounds, lon_bounds, projection, aspect


def get_shapefile_coords(shape: gpd.GeoDataFrame) -> tuple[np.ndarray, np.ndarray]:
    """Get the coordinates of the geometries in the GeoDataFrame"""
    lat_seqs = []
    lon_seqs = []
    for geom in shape.geometry:
        if geom.is_empty:
            continue
        if isinstance(geom, MultiPolygon):
            for polygon in geom.geoms:
                lats, lons = polygon.exterior.xy
                lat_seqs.append(lats)
                lon_seqs.append(lons)
        elif isinstance(geom, Polygon):
            lats, lons = geom.exterior.xy
            lat_seqs.append(lats)
            lon_seqs.append(lons)
        else:
            print(f'ERROR: cannot determine coordinates of unsupported geometry type: {type(geom)}. Skipping.')

    return np.concatenate(lon_seqs), np.concatenate(lat_seqs)


def generate_country_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:

    # load the flowcast gadm0 shapefile and add a column for the data values
    shapefile = get_admin0_shapes()
    country_data = {name: value for name, value in zip(data['admin0'].values, data.values)}
    shapefile = shapefile[shapefile['NAME_0'].isin(country_data.keys())].copy()
    shapefile['data_value'] = shapefile['NAME_0'].map(country_data)

    # Calculate best view bounds of all included geometries
    lats, lons = get_shapefile_coords(shapefile)
    lat_bounds, lon_bounds, projection, aspect = get_best_view(lats, lons, projection)

    # Create a figure with the given resolution and projection
    px = get_px_size()
    fig = plt.figure(figsize=(aspect*resolution*px, resolution*px))
    ax = plt.axes(projection=projection)

    # Set global extent and add coastlines
    ax.set_global()
    ax.coastlines()

    # Add country borders and crop to the computed bounds
    ax.add_feature(cfeature.BORDERS, linestyle=':', alpha=0.7)
    ax.set_extent(lon_bounds + lat_bounds, crs=ccrs.PlateCarree())

    # Plot each country with a color depending on its value in the data
    colormap_fn = cm.get_cmap(cmap)
    for _, country in shapefile.iterrows():
        if not pd.isnull(country['data_value']):
            ax.add_geometries(
                [country['geometry']],
                crs=ccrs.PlateCarree(),
                facecolor=colormap_fn(country['data_value'] / max(country_data.values())),
                edgecolor='black'
            )

    preview = save_fig_to_base64()
    return preview


def generate_country_lat_lon_preview(data: xr.DataArray, resolution: int, cmap, projection: ccrs.Projection) -> png64:

    # get lat/lon/data as numpy arrays
    lats = data['lat'].data
    lons = data['lon'].data
    # sum data along admin0 dimension to get rid of the extra dimension
    data = data.sum(dim='admin0', skipna=True, min_count=1).values

    # determine the lat/lon extents of the data
    lat_bounds, lon_bounds, projection, aspect = get_best_view(lats, lons, projection)

    # Create a figure with the given resolution and projection
    px = get_px_size()
    fig = plt.figure(figsize=(aspect*resolution*px, resolution*px))
    ax = plt.axes(projection=projection)

    # Set global extent and add coastlines
    ax.set_global()
    ax.coastlines()

    # Plot gridded data using pcolormesh, transformed to the map's projection
    mesh = ax.pcolormesh(lons, lats, data, transform=ccrs.PlateCarree(), cmap=cmap, shading='auto')

    # Add country borders and crop to the computed bounds
    ax.add_feature(cfeature.BORDERS, edgecolor='black', lw=0.8)
    ax.set_extent(lon_bounds + lat_bounds, crs=ccrs.PlateCarree())

    # save and return the preview
    preview = save_fig_to_base64()
    return preview


def generate_lat_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:
    # Define a range of longitudes to replicate the data
    lon = np.linspace(-180, 180, data.coords['lat'].size)

    # Replicate the data along the longitude dimension to create zonal bands
    data = data.expand_dims(lon=lon, axis=-1)
    data = data.expand_dims(admin0=['Earth'])

    return generate_country_lat_lon_preview(data, resolution, cmap, projection)


def generate_lon_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:
    # Define a range of latitudes to replicate the data
    lat = np.linspace(-90, 90, data.coords['lon'].size)

    # Replicate the data along the longitude dimension to create zonal bands
    data = data.expand_dims(lat=lat, axis=0)
    data = data.expand_dims(admin0=['Earth'])

    return generate_country_lat_lon_preview(data, resolution, cmap, projection)


# Since this one is expensive, it handles slicing and log preview generation
def generate_lat_country_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> tuple[list[png64], list[png64]]:
    # grab the list of countries from the data and flatten along the admin0 dimension
    countries: list[str] = data['admin0'].values.tolist()
    data = data.sum(dim='admin0', skipna=True, min_count=1)

    # Define a range of longitudes to replicate the data and replicate along lon to create zonal bands
    lon = np.linspace(-180, 180, data.coords['lat'].size)
    data = data.expand_dims(lon=lon, axis=-1)

    # reverse geocode with the country names so that only data within the boundaries of the countries is shown
    data = execute_pipeline_op(data, lambda pipe: pipe.reverse_geocode('data1', 'data', countries))

    return make_sliced(make_dual(generate_country_lat_lon_preview))(data, resolution, cmap, projection)


# Since this one is expensive, it handles slicing and log preview generation
def generate_lon_country_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> tuple[list[png64], list[png64]]:
    # grab the list of countries from the data and flatten along the admin0 dimension
    countries: list[str] = data['admin0'].values.tolist()
    data = data.sum(dim='admin0', skipna=True, min_count=1)

    # Define a range of latitudes to replicate the data and replicate along lat to create zonal bands
    lat = np.linspace(-90, 90, data.coords['lon'].size)
    data = data.expand_dims(lat=lat, axis=0)

    # reverse geocode with the country names so that only data within the boundaries of the countries is shown
    data = execute_pipeline_op(data, lambda pipe: pipe.reverse_geocode('data1', 'data', countries))

    return make_sliced(make_dual(generate_country_lat_lon_preview))(data, resolution, cmap, projection)


def execute_pipeline_op(data: xr.DataArray, op: Callable[[Pipeline], None]) -> xr.DataArray:
    pipe = Pipeline()
    pipe.set_geo_resolution('data')
    pipe.set_time_resolution('data')
    pipe.load('data', lambda: Variable(data, None, None))
    op(pipe)
    pipe.execute()
    data = pipe.get_last_value().data
    del pipe
    return data


def generate_missing_image(data, resolution: int, cmap: str, projection: ccrs.Projection) -> png64:
    px = 1/plt.rcParams['figure.dpi']  # pixel in inches
    fig, ax = plt.subplots(figsize=(resolution*px, resolution*px))
    ax.axis('off')
    ax.imshow(np.random.random((resolution, resolution)), cmap=cmap)
    ax.text(resolution/2, resolution/2, 'NO PREVIEW\nAVAILABLE', color='white', fontsize=36, ha='center', va='center')

    img = save_fig_to_base64()
    return img


def plot_png64(img: png64):
    """Plot a base64 encoded image"""
    img = base64.b64decode(img)
    img = BytesIO(img)
    img = plt.imread(img)
    plt.imshow(img)
    plt.axis('off')
    plt.show()

def add_timestamp_to_image(data: xr.DataArray, fn: PreviewGenerator, resolution: int, cmap: str, projection: ccrs.Projection, timestamp) -> tuple[png64, png64]:
    """Generate images with timestamp as title"""
    px = get_px_size()
    
    # Determine the extent from the data
    lon_min, lon_max = data['lon'].min().item(), data['lon'].max().item()
    lat_min, lat_max = data['lat'].min().item(), data['lat'].max().item()
    
    # Calculate aspect ratio based on data extent
    aspect_ratio = (lon_max - lon_min) / (lat_max - lat_min)
    
    # Regular image with timestamp
    fig = plt.figure(figsize=(resolution * px, resolution * px / aspect_ratio))
    ax = plt.axes(projection=projection)
    ax.set_title(f'Time: {timestamp}', fontsize=10)
    ax.set_extent([lon_min, lon_max, lat_min, lat_max], crs=ccrs.PlateCarree())
    ax.coastlines()
    ax.add_feature(cfeature.BORDERS, edgecolor='black', facecolor='lightgray', alpha=0.7)
    mesh = ax.pcolormesh(data['lon'], data['lat'], data, transform=ccrs.PlateCarree(), cmap=cmap, shading='auto')
    plt.colorbar(mesh, ax=ax, orientation='vertical', pad=0.05)
    ax.set_aspect(aspect_ratio)  # Maintain aspect ratio
    ax.axis('off')  # Remove axis labels
    img = save_fig_to_base64()
    plt.close(fig)
    
    # Log-transformed image with timestamp
    fig = plt.figure(figsize=(resolution * px, resolution * px / aspect_ratio))
    ax = plt.axes(projection=projection)
    ax.set_title(f'Time: {timestamp} (Log)', fontsize=10)
    ax.set_extent([lon_min, lon_max, lat_min, lat_max], crs=ccrs.PlateCarree())
    ax.coastlines()
    ax.add_feature(cfeature.BORDERS, edgecolor='black', facecolor='lightgray', alpha=0.7)
    log_data = symmetric_log(data)
    mesh = ax.pcolormesh(log_data['lon'], log_data['lat'], log_data, transform=ccrs.PlateCarree(), cmap=cmap, shading='auto')
    plt.colorbar(mesh, ax=ax, orientation='vertical', pad=0.05)
    ax.set_aspect(aspect_ratio)  # Maintain aspect ratio
    ax.axis('off')  # Remove axis labels
    log_img = save_fig_to_base64()
    plt.close(fig)
    
    return img, log_img