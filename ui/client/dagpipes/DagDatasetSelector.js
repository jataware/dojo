import React, { useState } from 'react';

import axios from 'axios';

import { useDispatch } from 'react-redux';

import format from 'date-fns/format';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { DataGrid, GridToolbarFilterButton, GridToolbarContainer } from '@mui/x-data-grid';

import { useNCDatasets } from '../components/SWRHooks';
import ExpandableDataGridCell from '../components/ExpandableDataGridCell';
import { setSavedDatasets, nextModelerStep } from './dagSlice';
import usePageTitle from '../components/uiComponents/usePageTitle';
import LoadingOverlay from '../components/LoadingOverlay';

const expandableCell = ({ value, colDef }) => (
  <ExpandableDataGridCell
    value={value}
    width={colDef.computedWidth}
  />
);

const columns = [
  {
    field: 'name',
    headerName: 'Name',
    renderCell: expandableCell,
    width: 288,
  },
  {
    field: 'id',
    headerName: 'ID',
    renderCell: expandableCell,
    width: 130,
  },
  {
    field: 'created_at',
    headerName: 'Date Created',
    valueFormatter: (params) => (
      format(new Date(params.value), 'MM/dd/yyyy')
    ),
    width: 120,
  },
  {
    field: 'maintainer.name',
    headerName: 'Maintainer',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    valueGetter: (params) => params.row?.maintainer.name,
    renderCell: expandableCell,
    width: 160,
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
    valueGetter: (params) => params.row?.fileData.raw.url,
    renderCell: expandableCell,
    minWidth: 200,
  },
];

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarFilterButton />
  </GridToolbarContainer>
);

const DagDatasetSelector = () => {
  const { datasets, datasetsLoading, datasetsError } = useNCDatasets();
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const dispatch = useDispatch();

  usePageTitle({ title: 'Data Modeling' });

  const handleNext = async () => {
    const annotations = selectedDatasets.map(async (datasetId) => {
      // get the annotations for each selected dataset so that we can get the column names
      const datasetAnnotation = await axios.get(`/api/dojo/indicators/${datasetId}`);
      return datasetAnnotation;
    });

    // once all our requests have returned
    Promise.all(annotations).then((responses) => {
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

      // and send it to redux
      dispatch(setSavedDatasets(parsedDatasets));
      dispatch(nextModelerStep());
    });
  };

  const handleRowSelection = (rows) => {
    setSelectedDatasets(rows);
  };

  if (datasetsLoading) {
    return <LoadingOverlay text="Loading Datasets..." />;
  }

  if (datasetsError) {
    return <LoadingOverlay error text="There was an error loading datasets. Please refresh the page to try again." />;
  }

  return (
    <Container maxWidth="lg">
      <Typography align="center" sx={{ marginTop: 4 }} gutterBottom variant="h4">
        Data Modeling
      </Typography>
      <Typography align="center" sx={{ marginBottom: 4 }} variant="subtitle1">
        Select any number of netcdf datasets from
        the table below to load into the data modeling tool
      </Typography>
      <DataGrid
        checkboxSelection
        autoHeight
        columns={columns}
        rows={datasets}
        onSelectionModelChange={handleRowSelection}
        components={{ Toolbar: CustomToolbar }}
        disableColumnMenu
      />
      <Button onClick={handleNext} sx={{ marginY: 1 }} disabled={!selectedDatasets.length}>
        Use these datasets
      </Button>
    </Container>
  );
};

export default DagDatasetSelector;
