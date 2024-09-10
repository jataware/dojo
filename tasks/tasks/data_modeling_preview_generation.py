from typing import Protocol
import numpy as np
import xarray as xr
from matplotlib import pyplot as plt
import base64
from io import BytesIO
from cartopy import crs as ccrs
from cartopy import feature as cfeature
import geopandas as gpd
import pandas as pd
import matplotlib.cm as cm
import pycountry


def symmetric_log(data: xr.DataArray) -> xr.DataArray:
    """Apply a symmetric log transform to the data"""
    return np.sign(data) * np.log(np.abs(data) + 1)


def get_px_size() -> float:
    return 1/plt.rcParams['figure.dpi']  # pixel in inches



def generate_preview(data: xr.DataArray, resolution=256, cmap='viridis', projection:ccrs.Projection=ccrs.Robinson()) -> dict:
    """Generate a preview of the data for the frontend"""
    log_data = symmetric_log(data)

    # different cases for data with different dimensions
    coords_set = set(data.coords)
    contains_time = 'time' in coords_set
    coords_set.discard('time')

    if coords_set == {}:
        fn = generate_time_preview
    elif coords_set == {'lat'}:
        fn = generate_lat_preview
    elif coords_set == {'lon'}:
        fn = generate_lon_preview
    elif coords_set == {'lat', 'lon'}:
        fn = generate_lat_lon_preview
    elif coords_set == {'admin0'}:
        fn = generate_country_preview
    elif coords_set == {'lat', 'lon', 'admin0'}:
        fn = generate_country_lat_lon_preview

    # TODO: other cases
    # elif coords_set == {'lat', 'admin0'}: ...
    # elif coords_set == {'lon', 'admin0'}: ...

    else:
        # raise ValueError(f'Unhandled data dimensions: {data.dims}')
        print(f'Unhandled data dimensions: {data.dims}')
        fn = generate_random_image

    if len(coords_set) == 0 or not contains_time:
        previews = [fn(data, resolution, cmap, projection)]
        log_previews = [fn(log_data, resolution, cmap, projection)]
    else:
        previews = generate_sliced_time_preview(fn, data, resolution, cmap, projection)
        log_previews = generate_sliced_time_preview(fn, log_data, resolution, cmap, projection)

    preview = {
        'shape': data.shape,
        'dtype': str(data.dtype),
        'dims': list(data.dims),
        'has_NaN': data.isnull().any().item(),
        'preview': previews,
        'log_preview': log_previews
    }
    return preview


class PreviewGenerator(Protocol):
    def __call__(self, data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> str: ...


def generate_sliced_time_preview(slice_preview_fn: PreviewGenerator, data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection, max_images=5):
    """
    Generate a set of base64 image previews of the given data array sliced along time dimension

    Args:
        slice_preview_fn: a function that generates a base64 image preview of a single slice of the data
        data: the data array to generate previews of
        resolution: the resolution of the preview images
        cmap: the colormap to use for the preview images
        max_images: the maximum number of images to generate
    """
    indices = np.linspace(0, len(data['time']) - 1, max_images, dtype=int)
    indices = np.unique(indices)  # remove duplicates

    frames = [
        slice_preview_fn(data.isel(time=i), resolution, cmap, projection)
        for i in indices
    ]
    return frames


def generate_lat_lon_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> str:
    """Generate a base64 image preview of the given data array containing only lat and lon dimensions"""
    aspect_ratio = data.sizes['lon'] / data.sizes['lat']
    px = 1/plt.rcParams['figure.dpi']  # pixel in inches
    figsize = (resolution * aspect_ratio * px, resolution * px)

    # plot and save the regular data
    fig, ax = plt.subplots(figsize=figsize)
    ax.axis('off')
    data.plot(ax=ax, cmap=cmap, add_colorbar=False)
    ax.set_title('')
    ax.set_xlabel('')
    ax.set_ylabel('')
    ax.set_yticks([])
    ax.set_xticks([])
    # plt.show(); pdb.set_trace(); ...; return
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    preview = base64.b64encode(buf.getvalue()).decode('utf-8')

    return preview


def generate_time_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> str:
    """just use the built-in xarray plot method"""
    fig, ax = plt.subplots(figsize=(resolution, resolution))
    ax.axis('off')
    data.plot(ax=ax, cmap=cmap, add_colorbar=False)
    # plt.show(); pdb.set_trace(); ...; return
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    preview = base64.b64encode(buf.getvalue()).decode('utf-8')
    return preview


def gadm_admin0_to_iso3(admin0: str) -> str:
    """Convert a GADM admin0 name to an ISO 3166-1 alpha-3 country code"""
    try:
        return pycountry.countries.lookup(admin0).alpha_3
    except:
        raise ValueError(f'Could not find ISO 3166-1 alpha-3 code for {admin0}') from None


def try_or_none(fn, *args, message: str|None = None, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        print(f'Error: {e}. {message or ""}')
        return None


def generate_country_preview(data: xr.DataArray, resolution: int, cmap: str, projection: ccrs.Projection) -> str:
    
    # convert the data to a dictionary mapping from iso3 names to data values
    iso3_names = [try_or_none(gadm_admin0_to_iso3, name, message='skipping for preview')
                  for name in data['admin0'].values]
    assert len(data.values) == len(iso3_names), f'{len(data.values)=} != {len(iso3_names)=}'
    country_data = dict(filter(lambda x: x[0] is not None, zip(iso3_names, data.values)))

    colormap_fn = cm.get_cmap(cmap)


    # Create a figure with a Mollweide projection
    px = get_px_size()
    fig = plt.figure(figsize=(2*resolution*px, resolution*px))
    ax = plt.axes(projection=projection)

    # Set global extent and add coastlines
    ax.set_global()
    ax.coastlines()

    # Add country borders
    ax.add_feature(cfeature.BORDERS, linestyle=':', alpha=0.7)

    # Load Natural Earth shapefile of countries and filter so it only contains the countries we have data for
    shapefile = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
    shapefile = shapefile[shapefile['iso_a3'].isin(country_data.keys())]

    # Add data to the shapefile
    shapefile['data_value'] = shapefile['iso_a3'].map(country_data)

    # Plot each country with a color depending on its value in the data
    for _, country in shapefile.iterrows():
        if not pd.isnull(country['data_value']):
            ax.add_geometries(
                [country['geometry']],
                crs=ccrs.PlateCarree(),
                facecolor=colormap_fn(country['data_value'] / max(country_data.values())),
                edgecolor='black'
            )
    # plt.show(); pdb.set_trace(); ...; return
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    preview = base64.b64encode(buf.getvalue()).decode('utf-8')
    return preview


def generate_country_lat_lon_preview(data: xr.DataArray, resolution: int, cmap, projection: ccrs.Projection) -> str:
    px = get_px_size()
    fig = plt.figure(figsize=(2*resolution*px, resolution*px))
    ax = plt.axes(projection=projection)

    # Set global extent and add coastlines
    ax.set_global()
    ax.coastlines()

    # get lat/lon/data as numpy arrays
    lat = data['lat'].data
    lon = data['lon'].data
    # sum data along admin0 dimension to get rid of the extra dimension
    data = data.sum(dim='admin0', skipna=True, min_count=1).values

    # Plot gridded data using pcolormesh, transformed to the map's projection
    mesh = ax.pcolormesh(lon, lat, data, transform=ccrs.PlateCarree(), cmap=cmap, shading='auto')

    # Add country borders
    ax.add_feature(cfeature.BORDERS, linestyle=':', edgecolor='black')

    # Optionally, if you have a geopandas DataFrame of countries, plot it:
    shapefile = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))

    # Ensure countries are plotted in the correct projection
    for _, country in shapefile.iterrows():
        ax.add_geometries(
            [country['geometry']], crs=ccrs.PlateCarree(),
            facecolor='none', edgecolor='black', lw=0.8
        )

    # Show the plot
    # plt.show(); pdb.set_trace(); ...; return
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    preview = base64.b64encode(buf.getvalue()).decode('utf-8')
    return preview


def generate_lat_preview(data: xr.DataArray, resolution:int, cmap: str, projection: ccrs.Projection) -> str:
    # Define a range of longitudes to replicate the data
    lon = np.linspace(-180, 180, data.coords['lat'].size)

    # Replicate the data along the longitude dimension to create zonal bands
    data = data.expand_dims(lon=lon, axis=-1)
    data = data.expand_dims(admin0=['Earth'])

    return generate_country_lat_lon_preview(data, resolution, cmap, projection)

def generate_lon_preview(data: xr.DataArray, resolution:int, cmap: str, projection: ccrs.Projection) -> str:
    # Define a range of latitudes to replicate the data
    lat = np.linspace(-90, 90, data.coords['lon'].size)

    # Replicate the data along the longitude dimension to create zonal bands
    data = data.expand_dims(lat=lat, axis=0)
    data = data.expand_dims(admin0=['Earth'])

    return generate_country_lat_lon_preview(data, resolution, cmap, projection)



def generate_random_image(data, resolution: int, cmap: str, projection: ccrs.Projection) -> str:
    px = 1/plt.rcParams['figure.dpi']  # pixel in inches
    fig, ax = plt.subplots(figsize=(resolution*px, resolution*px))
    ax.axis('off')
    ax.imshow(np.random.random((resolution, resolution)), cmap=cmap)
    # plt.show(); pdb.set_trace(); ...; return
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    randimg = base64.b64encode(buf.getvalue()).decode('utf-8')
    return randimg


def plot_png64(img: str):
    """Plot a base64 encoded image"""
    img = base64.b64decode(img)
    img = BytesIO(img)
    img = plt.imread(img)
    plt.imshow(img)
    plt.axis('off')
    plt.show()
