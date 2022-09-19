/* eslint-disable sort-imports */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { DataGrid } from '@material-ui/data-grid';

import LoadingOverlay from './LoadingOverlay';
import Search from './SearchItems';
import { formatDatetime, parseDatetimeString } from '../utils';
import { Status } from './RunSummary';

const styles = (theme) => ({
  root: {
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  gridContainer: {
    height: '400px',
    minWidth: '900px',
    margin: '0 auto',
  },
  header: {
    marginBottom: theme.spacing(3),
  }
});

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 90,
    flex: 2
  },
  {
    field: 'model_id',
    headerName: 'Model ID',
    minWidth: 180,
    flex: 3,
  },
  {
    field: 'model_name',
    headerName: 'Model Name',
    minWidth: 110,
    flex: 1,
  },
  {
    field: 'created_at',
    headerName: 'Created On',
    minWidth: 70,
    flex: 2,
    valueGetter: (params) => {
      const ts = params.row?.created_at || undefined;

      return formatDatetime(new Date(ts));
    }
  },
  {
    field: 'executed_at',
    headerName: 'Completed On',
    minWidth: 70,
    flex: 2,
    valueGetter: (params) => {
      const executedAt = params.row?.attributes?.executed_at;
      return executedAt ? formatDatetime(parseDatetimeString(executedAt)) : '-';
    }
  },
  {
    field: 'status',
    headerName: 'Status',
    valueGetter: (params) => params.row?.attributes?.status,
    renderCell: ({ value }) => (
      <Status responsive>
        {value}
      </Status>
    ),
    minWidth: 60,
    flex: 1
  },
  {
    field: 'link',
    headerName: 'Actions',
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }) => (
      <Button
        component={Link}
        to={`/runs/${row.id}`}
        variant="outlined"
      >
        Summary
      </Button>
    ),
    minWidth: 120
  },
];

const getRuns = async (setRuns, setRunsError, setRunsLoading, scrollId) => {
  if (!scrollId) {
    // only do this for the first call
    // so we don't show the full page spinner for every subsequent set of run
    setRunsLoading(true);
  }

  const url = scrollId
    ? `/api/dojo/runs?scroll_id=${scrollId}` : '/api/dojo/runs';
  axios.get(url)
    .then((response) => {
      console.log('request for /runs response:', response);
      setRuns((prev) => {
        setRunsLoading(false);
        return prev.concat(response.data?.results);
      });

      // when there's no scroll id, we've hit the end of the results
      if (response.data?.scroll_id) {
        getRuns(setRuns, setRunsError, setRunsLoading, response.data?.scroll_id);
      }
    })
    .catch((error) => {
      console.log('error:', error);
      setRunsError(true);
    });
};

// TODO filter by tags, when these are not shown?
const filterKeys = ['id', 'model_name', 'tags'];

const rowsPerPageOptions = [25, 50, 100];

const ViewRuns = ({ classes }) => {
  const [runs, setRuns] = useState([]);
  const [fetchErrors, setFetchErrors] = useState(false);
  const [areRunsLoading, setAreRunsLoading] = useState(false);

  const [search, setSearch] = useState(null);
  const [pageSize, setPageSize] = useState(rowsPerPageOptions[0]);

  useEffect(() => {
    getRuns(setRuns, setFetchErrors, setAreRunsLoading);
    document.title = 'View Model Runs - Dojo';
  }, []);

  if (areRunsLoading) {
    return <LoadingOverlay text="Loading Model Runs Data" />;
  }

  if (fetchErrors) {
    return (
      <LoadingOverlay
        text="There was an error loading the list of all model runs"
        error
      />
    );
  }

  return !runs?.length ? (
    <LoadingOverlay text="No Previous Runs Found" error />
  ) : (
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
        All Model Runs
      </Typography>
      <div className={classes.gridContainer}>
        <Search
          setSearch={setSearch}
          items={runs}
          name="Run"
          searchKeys={filterKeys}
        />
        <DataGrid
          autoHeight
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          rows={search || runs}
        />
      </div>
    </Container>
  );
};

export default withStyles(styles)(ViewRuns);
