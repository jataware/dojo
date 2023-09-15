import React, { useState } from 'react';

import axios from 'axios';

import { useDispatch } from 'react-redux';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { DataGrid } from '@mui/x-data-grid';

import { useNCDatasets } from '../components/SWRHooks';
import ExpandableDataGridCell from '../components/ExpandableDataGridCell';
import { setSavedDatasets } from './dagSlice';

const expandableCell = ({ value, colDef }) => (
  <ExpandableDataGridCell
    value={value}
    width={colDef.computedWidth}
  />
);

const columns = [
  { field: 'name', headerName: 'Name', width: 130 },
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'created_at',
    headerName: 'Date Created',
    // TODO: format date
    // valueFormatter: (params) => (
    //   new Date(params.created_at).toLocaleDateString(
    //     'en-US',
    //     {
    //       timeZone: 'utc',
    //       day: '2-digit',
    //       month: '2-digit',
    //       year: 'numeric'
    //     },
    //   )
    // ),
    width: 90,
  },
  {
    field: 'maintainer.name',
    headerName: 'Maintainer',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) => params.row?.maintainer.name,
  },
  {
    field: 'description',
    headerName: 'Description',
    renderCell: expandableCell,
    minWidth: 200,
  },
  {
    field: 'fileData.raw.url',
    headerName: 'File Name',
    minWidth: 100,
    valueGetter: (params) => params.row?.fileData.raw.url,
  },
];

// get all datasets from /indicators/ncfiles (bad endpoint name, change later)
// let user select which datasets they want to join
// when loading the next page, hit the annotations endpoint for those datasets to get the columns
// /api/dojo/indicators/${datasetInfo.id}/annotations - Annotate.js - getAnnotations line 114/137
const DagDatasetSelector = () => {
  const { datasets, datasetsLoading, datasetsError } = useNCDatasets();
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const dispatch = useDispatch();

  const handleNext = async () => {
    const annotations = selectedDatasets.map(async (datasetId) => {
      // get the annotations for each selected dataset so that we can get the column names
      const datasetAnnotation = await axios.get(`/api/dojo/indicators/${datasetId}`);
      return datasetAnnotation;
    });

    // once all our requests have returned
    Promise.all(annotations).then((responses) => {
      console.log('THIS IS RESPONSES', responses)
      // build up an object
      const parsedDatasets = responses.reduce((accumulator, response, index) => {
        // retrieve all the feature names and put them into an array
        const allFeatureNames = response.data.outputs.map((feature) => feature.name);
        // store the name and features under the dataset id
        accumulator[selectedDatasets[index]] = {
          name: response.data.name, features: allFeatureNames
        };
        return accumulator;
      }, {});

      console.log('THIS IS parsedDatasets', parsedDatasets);
      // and send it to redux
      dispatch(setSavedDatasets(parsedDatasets));
    });
  };

  const handleRowSelection = (rows) => {
    console.log('Selecting a row?', rows);
    setSelectedDatasets(rows);
  };

  if (datasetsLoading) {
    return <h3>Loading...</h3>
  }

  if (datasetsError) {
    return <h3>Error</h3>
  }
console.log('datasets', datasets)
  return (
    <Container maxWidth="lg">
      <DataGrid
        checkboxSelection
        autoHeight
        columns={columns}
        rows={datasets}
        onSelectionModelChange={handleRowSelection}
      />
      <Button onClick={handleNext}>
        Use these datasets
      </Button>
    </Container>
  );
};
// id, name, description, created_at, maintainer, fileData, deprecated
export default DagDatasetSelector;
