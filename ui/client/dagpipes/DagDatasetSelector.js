import React from 'react';

import { useNCDatasets } from '../components/SWRHooks';

// get all datasets from /indicators/ncfiles (bad endpoint name, change later)
// let user select which datasets they want to join
// when loading the next page, hit the annotations endpoint for those datasets to get the columns
// /api/dojo/indicators/${datasetInfo.id}/annotations - Annotate.js - getAnnotations line 114/137
const DagDatasetSelector = () => {
  const { datasets, datasetsLoading, datasetsError } = useNCDatasets();

  if (datasetsLoading) {
    return <h3>Loading...</h3>
  }

  if (datasetsError) {
    return <h3>Error</h3>
  }
console.log('datasets', datasets)
  return (
    <div>
      {datasets.map((dataset) => (
        <div>
          <h4>This is the dataset: {dataset.name}</h4>
          <span>{`${dataset.id} | ${dataset.fileData.raw.url}`}</span>
        </div>
      ))}
    </div>
  );
};
// id, name, description, created_at, maintainer, fileData, deprecated
export default DagDatasetSelector;
