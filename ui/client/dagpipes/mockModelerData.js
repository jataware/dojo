const datasetResponse = [
  {data: {
      "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "name": "CMIP6",
      "description": "CMIP6 dataset with tasmax feature",
      "outputs": [
        {
          "name": "tasmax",
          "display_name": "tasmax",
          "description": "Maximum temperature",
          "type": "float",
          "unit": "K",
          "is_primary": true
        }
      ],
      "fileData": {
        "raw": {
          "uploaded": true,
          "url": "cmip6_tasmax.nc",
          "rawFileName": "cmip6_data.nc"
        }
      },
      "feature_names": ["tasmax"]
    }
  },
  {data: {
      "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "name": "MODIS",
      "description": "MODIS dataset with land_cover feature",
      "outputs": [
        {
          "name": "land_cover",
          "display_name": "land_cover",
          "description": "Land cover type",
          "type": "category",
          "unit": "type",
          "is_primary": true
        }
      ],
      "fileData": {
        "raw": {
          "uploaded": true,
          "url": "modis_land_cover.nc",
          "rawFileName": "modis_data.nc"
        }
      },
      "feature_names": ["land_cover"]
    },
  },
  {data: {
      "id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      "name": "GPW",
      "description": "GPW dataset with population feature",
      "outputs": [
        {
          "name": "population",
          "display_name": "population",
          "description": "Population count",
          "type": "integer",
          "unit": "count",
          "is_primary": true
        }
      ],
      "fileData": {
        "raw": {
          "uploaded": true,
          "url": "gpw_population.nc",
          "rawFileName": "gpw_data.nc"
        }
      },
      "feature_names": ["population"]
    },
  }
];

const datasets = [
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "name": "CMIP6",
    "description": "CMIP6 dataset with tasmax feature",
    "created_at": 1695048006969,
    "maintainer": {
      "name": "test",
      "email": "test@test.com",
      "organization": null,
      "website": null
    },
    "deprecated": false,
    "fileData": {
      "raw": {
        "rawFileName": "cmip6_data.nc",
        "url": "cmip6_tasmax.nc"
      }
    }
  },
  {
    "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    "name": "MODIS",
    "description": "MODIS dataset with land_cover feature",
    "created_at": 1695048006969,
    "maintainer": {
      "name": "test",
      "email": "test@test.com",
      "organization": null,
      "website": null
    },
    "deprecated": false,
    "fileData": {
      "raw": {
        "rawFileName": "modis_data.nc",
        "url": "modis_land_cover.nc"
      }
    }
  },
  {
    "id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    "name": "GPW",
    "description": "GPW dataset with population feature",
    "created_at": 1695048006969,
    "maintainer": {
      "name": "test",
      "email": "test@test.com",
      "organization": null,
      "website": null
    },
    "deprecated": false,
    "fileData": {
      "raw": {
        "rawFileName": "gpw_data.nc",
        "url": "gpw_population.nc"
      }
    }
  }
]