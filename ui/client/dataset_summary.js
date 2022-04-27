import React from 'react';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { useLocation } from 'react-router-dom';

import DatasetSummaryDetails from './components/DatasetSummaryDetails';
import DatasetSummaryOutputsTable from './components/DatasetSummaryOutputsTable';
import LoadingOverlay from './components/LoadingOverlay';
import {
  useDataset
} from './components/SWRHooks';

const useStyles = makeStyles((theme) => ({
  containers: {
    padding: [[theme.spacing(1), theme.spacing(8), theme.spacing(1)]],
  },
  tablePanel: {
    paddingBottom: '400px !important',
  },
  root: {
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  headerContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr repeat(3, auto) 1fr',
    gridColumnGap: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    '& > :first-child': {
      placeSelf: 'start',
    },
  },
  detailsPanel: {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '4px',
    borderWidth: 0,
    width: '100%',
    '&:focus': {
      outlineColor: '#fff',
      outlineWidth: 0,
      boxShadow: '0 0 10px #0c0c0c',
    },
  },
  runCommandContainer: {
    paddingBottom: theme.spacing(1),
  },
  headerText: {
    // this matches up with the headers in FileCardList
    paddingTop: '10px',
  },

}));

const Page = ({
  datasetIdQueryParam
}) => {
  const datasetId = datasetIdQueryParam;
  const {
    dataset, datasetLoading, datasetError
  } = useDataset(datasetId);

  const classes = useStyles();
  const theme = useTheme();
  const mediumBreakpoint = useMediaQuery(theme.breakpoints.down('md'));

  if (datasetLoading) {
    return <LoadingOverlay text="Loading summary" />;
  }

  if (datasetError) {
    return (
      <LoadingOverlay
        text="There was an error loading the dataset summary"
        error={datasetError}
      />
    );
  }

  return (
    <div>

      <Container
        className={classes.root}
        component="main"
        maxWidth={mediumBreakpoint ? 'md' : 'xl'}
      >
        <Typography
          className={classes.header}
          component="h3"
          variant="h4"
          align="center"
        >
          Dataset Summary
        </Typography>
        <Grid container className={classes.containers}>
          <Grid item xs={12}>
            <Typography
              align="center"
              color="textSecondary"
              variant="h6"
              gutterBottom
              className={classes.headerText}
            >
              Details
            </Typography>
            <div className={classes.detailsPanel}>

              <DatasetSummaryDetails dataset={dataset} />
            </div>
          </Grid>
        </Grid>
        <Grid container className={classes.containers}>
          <Grid className={classes.tablePanel} item xs={12}>
            <Typography
              align="center"
              color="textSecondary"
              variant="h6"
              gutterBottom
              className={classes.headerText}
            >
              Features
            </Typography>

            <DatasetSummaryOutputsTable dataset={dataset} />
          </Grid>
        </Grid>

      </Container>

    </div>
  );
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const DatasetSummary = () => {
  const query = useQuery();
  const dataset = query.get('dataset');

  if (dataset) {
    return <Page datasetIdQueryParam={dataset} />;
  }
};

export default DatasetSummary;
