import React, { useEffect, useState } from 'react';

import axios from 'axios';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { DataGrid } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import ExpandableDataGridCell from './ExpandableDataGridCell';
import LoadingOverlay from './LoadingOverlay';
import SearchDatasets from './SearchDatasets';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  gridContainer: {
    height: '400px',
    maxWidth: '2000px',
    minWidth: '900px',
    margin: '0 auto',
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  published: {
    display: 'flex',
    alignItems: 'center',
  },
  publishedCheck: {
    color: theme.palette.success.light,
    marginBottom: '4px',
    marginLeft: '4px',
  },
  searchWrapper: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    width: '350px',
    marginRight: theme.spacing(2),
  },
  SuperAppThemeHeader: {
    fontWeight: 'bold',
    fontSize: '17px',
    backgroundColor: theme.palette.action.hover,
  }
}));

const getDatasets = (setDatasets, setDatasetsError, setDatasetsLoading) => {
  // only do this for the first call to getModels, when we don't have a scrollId
  // so we don't show the full page spinner for every subsequent set of models
  setDatasetsLoading(true);

  const url = '/api/dojo/indicators/latest';
  axios.get(url)
    .then((response) => {
      setDatasetsLoading(false);
      console.log(response.data);
      setDatasets(response.data);
    })
    .catch((error) => {
      console.log('error:', error);
      setDatasetsError(true);
    });
};

function ViewDatasets() {
  const classes = useStyles();
  const [datasets, setDatasets] = useState([]);
  const [datasetsError, setDatasetsError] = useState(false);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [searchedDatasets, setSearchedDatasets] = useState(null);

  useEffect(() => {
    // only do this once when the page loads
    getDatasets(setDatasets, setDatasetsError, setDatasetsLoading);
  }, []);
  if (datasetsLoading) {
    return <LoadingOverlay text="Loading Datasets" />;
  }
  if (datasetsError) {
    return (
      <LoadingOverlay
        text="There was an error loading the list of all datasets"
        error
      />
    );
  }

  if (!datasets?.length) {
    return <LoadingOverlay text="No Datasets Found" error />;
  }

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
      headerClassName: classes.SuperAppThemeHeader,
      minWidth: 200,
      flex: 1,
    },
    {
      field: 'id', headerName: 'ID', minWidth: 250, flex: 1, headerClassName: classes.SuperAppThemeHeader,
    },
    {
      field: 'maintainer.name',
      headerName: 'Maintainer',
      minWidth: 140,
      flex: 1,
      valueGetter: (params) => params.row?.maintainer.name,
      headerClassName: classes.SuperAppThemeHeader,
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      valueFormatter: (params) => (
        new Date(params.value).toLocaleDateString(
          'en-US',
          {
            timeZone: 'utc',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          },
        )
      ),
      minWidth: 140,
      flex: 1,
      headerClassName: classes.SuperAppThemeHeader,
    },
    {
      field: 'description',
      headerName: 'Description',
      renderCell: expandableCell,
      minWidth: 200,
      flex: 1,
      headerClassName: classes.SuperAppThemeHeader,
    },
    {
      field: 'link',
      headerName: ' ',
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Button
          href={`/dataset_summary?dataset=${row.id}`}
          variant="outlined"
        >
          View Dataset
        </Button>
      ),
      minWidth: 210,
      headerClassName: classes.SuperAppThemeHeader,
    },
  ];

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="xl"
    >
      <Typography
        className={classes.header}
        component="h3"
        variant="h4"
        align="center"
      >
        All Datasets
      </Typography>
      <div className={classes.gridContainer}>
        <SearchDatasets setSearchedDatasets={setSearchedDatasets} datasets={datasets} />
        <DataGrid
          autoHeight
          columns={columns}
          rows={searchedDatasets !== null ? searchedDatasets : datasets}
        />
      </div>
    </Container>
  );
}

export default ViewDatasets;
