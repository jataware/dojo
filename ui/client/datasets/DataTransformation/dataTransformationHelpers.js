// this helps generate the lat/lon column arguments for all our geo elwood calls
export const getPrimaryLatLonColumns = (geoAnnotations) => {
  let lat_column = null;
  let lon_column = null;
  geoAnnotations.forEach((geo) => {
    // only include the columns if they are primary and lat/lon
    if (geo.primary_geo === true) {
      if (geo.geo_type === 'latitude') {
        lat_column = geo.name;
      }
      if (geo.geo_type === 'longitude') {
        lon_column = geo.name;
      }
    }
  });
  // Only return anything if we have both, otherwise return null
  return (lat_column && lon_column) ? { lat_column, lon_column } : null;
};

export const generateProcessTempResArgs = (annotations, resolution, aggregation) => {
  const geoColumns = getPrimaryLatLonColumns(annotations.annotations.geo);
  const args = {
    datetime_column: annotations.annotations.date[0].name,
    datetime_bucket: resolution.alias,
    aggregation_function_list: [aggregation],
    // TODO: the order of these shouldn't matter, as these are just columns that we skip
    // for temporal resolution scaling?
    geo_columns: geoColumns,
  };

  return args;
};

export const generateProcessGeoResArgs = (
  annotations, newMapResolution, oldMapResolution, aggregation
) => {
  const geoColumns = getPrimaryLatLonColumns(annotations.annotations.geo);
  const args = {
    datetime_column: [annotations?.annotations.date[0].name],
    geo_columns: geoColumns,
    scale_multi: newMapResolution / oldMapResolution,
    aggregation_function_list: [aggregation],
    scale: oldMapResolution,
  };
  return args;
};

export const generateProcessGeoCovArgs = (annotations, drawings) => {
  const geoColumns = getPrimaryLatLonColumns(annotations.annotations.geo);
  const args = {
    map_shapes: drawings,
    geo_columns: geoColumns,
  };
  return args;
};

export const generateProcessTempCovArgs = ({ annotations, start, end }) => (
  {
    datetime_column: annotations.annotations.date[0].name,
    time_ranges: [{ start, end }],
  }
);

export const areLatLngAnnotated = (annotations) => {
  if (!annotations?.annotations?.geo) return false;
  let hasLatAndLng = false;

  // check that we have both latitude and longitude primary fields annotated
  const latCount = annotations.annotations.geo.filter(
    (obj) => obj.geo_type === 'latitude' && obj.primary_geo === true
  ).length;
  const lngCount = annotations.annotations.geo.filter(
    (obj) => obj.geo_type === 'longitude' && obj.primary_geo === true
  ).length;

  // if we have 1 of each, then return true
  if (latCount === 1 && lngCount === 1) {
    hasLatAndLng = true;
  }
  return hasLatAndLng;
};
