import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Container from '@material-ui/core/Container';
import { DataGrid } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { darken, makeStyles } from '@material-ui/core/styles';
import ExpandableDataGridCell from './ExpandableDataGridCell';
import LoadingOverlay from './LoadingOverlay';
import SearchDatasets from './SearchDatasets';

import ViewFeatures from './ViewFeatures';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: [[theme.spacing(8), theme.spacing(2), theme.spacing(2)]],
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxWidth: '2000px',
    minWidth: '900px',
    '& .deprecatedDataset': {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.grey[500],
      '&:hover': {
        backgroundColor: darken(theme.palette.grey[200], 0.1),
      },
    },
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
  aboveTableWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
}));

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
    minWidth: 200,
    flex: 1,
    valueGetter: (params) => (
      params.getValue(params.id, 'deprecated')
        ? `DEPRECATED - ${params.row.name}` : params.row.name
    )
  },
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 250,
    flex: 1,
  },
  {
    field: 'maintainer.name',
    headerName: 'Maintainer',
    minWidth: 140,
    flex: 1,
    valueGetter: (params) => params.row?.maintainer.name,
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
  },
  {
    field: 'description',
    headerName: 'Description',
    renderCell: expandableCell,
    minWidth: 200,
    flex: 1,
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
  },
];

const getDatasets = (setDatasets, setDatasetsError, setDatasetsLoading) => {
  // only do this for the first call to getDatasets, when we don't have a scrollId
  // so we don't show the full page spinner for every subsequent set of models
  setDatasetsLoading(true);

  // pass along a timestamp to ensure that our url is different every time
  // otherwise the browser may cache the request and we won't see updates if someone
  // deprecates their dataset and comes back to this page
  const url = `/api/dojo/indicators/latest?requestTime=${Date.now()}&include_features=true`;
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

/**
 *
 */
function ViewDatasets() {
  const classes = useStyles();
  const [datasets, setDatasets] = useState([]);
  const [datasetsError, setDatasetsError] = useState(false);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [searchedDatasets, setSearchedDatasets] = useState(null);
  const [displayDeprecated, setDisplayDeprecated] = useState(false);
  const [displayedDatasets, setDisplayedDatasets] = useState([]);

  const [mode, setMode] = useState('datasets');

  const handleMode = (event, newMode) => {
    setMode(newMode);
  };

  const isModeDatasets = mode === 'datasets';
  const isModeFeatures = mode === 'features';

  useEffect(() => {
    // only do this once when the page loads
    getDatasets(setDatasets, setDatasetsError, setDatasetsLoading);
    document.title = 'View Datasets - Dojo';
  }, []);

  useEffect(() => {
    // when we load our datasets
    if (datasets?.length) {
      // // filter out all the deprecated ones
      const filtered = datasets.filter((dataset) => (!dataset.deprecated));
      setDisplayedDatasets(filtered);
    }
  }, [datasets]);

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

  const toggleDeprecatedDatasets = () => {
    if (displayDeprecated) {
      // we are currently showing the deprecated datasets, so filter them out
      const filtered = datasets.filter((dataset) => (!dataset.deprecated));
      setDisplayedDatasets(filtered);
      // and toggle the button state back
      setDisplayDeprecated(false);
    } else {
      // we want to show all the datasets
      setDisplayedDatasets(datasets);
      setDisplayDeprecated(true);
    }
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="xl"
    >
      <div style={{
        display: 'flex', flexDirection: 'column', width: '100%', flex: '1 0 100%'
      }}
      >
        <Typography
          className={classes.header}
          component="h3"
          variant="h4"
          align="center"
        >
          All Datasets & Features
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">
            Browse By
          </Typography>
          &nbsp;
          <ToggleButtonGroup
            exclusive
            value={mode}
            onChange={handleMode}
          >
            <ToggleButton value="datasets">
              Datasets
            </ToggleButton>
            <ToggleButton value="features">
              Features
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        <br />

        <div className={classes.gridContainer}>
          {isModeDatasets ? (
            <>
              <div className={classes.aboveTableWrapper}>
                <SearchDatasets
                  setSearchedDatasets={setSearchedDatasets}
                  datasets={displayedDatasets}
                />
                <Button
                  component={Link}
                  size="large"
                  variant="outlined"
                  color="primary"
                  disableElevation
                  to="/datasets/register"
                >
                  Register a New Dataset
                </Button>
                <Button
                  color="primary"
                  disableElevation
                  variant="outlined"
                  size="large"
                  onClick={toggleDeprecatedDatasets}
                >
                  {displayDeprecated ? 'Hide Deprecated Datasets' : 'Show Deprecated Datasets'}
                </Button>
              </div>

              <DataGrid
                autoHeight
                columns={columns}
                rows={searchedDatasets !== null ? searchedDatasets : displayedDatasets}
                getRowClassName={
                  (params) => params.getValue(params.id, 'deprecated') && 'deprecatedDataset'
                }
              />
            </>
          ) : (
            <ViewFeatures />
          )}
        </div>
      </div>
    </Container>
  );
}

export default ViewDatasets;
