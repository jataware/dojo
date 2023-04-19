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
