export const generateProcessTempResArgs = (annotations, resolution, aggregation) => {
  const args = {
    datetime_column: annotations.annotations.date[0].name,
    datetime_bucket: resolution.alias,
    aggregation_function_list: [aggregation],
    geo_columns: [],
  };
  annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

  return args;
};

export const generateProcessGeoResArgs = (annotations, newMapResolution, oldMapResolution) => {
  const args = {
    datetime_column: [annotations?.annotations.date[0].name],
    geo_columns: [],
    scale_multi: newMapResolution,
    scale: oldMapResolution,
  };
  annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));
  return args;
};

export const generateProcessGeoCovArgs = (annotations, drawings) => {
  const args = {
    map_shapes: drawings,
    geo_columns: [],
  };
  annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));
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
