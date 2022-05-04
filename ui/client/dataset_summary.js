import React, { useEffect, useState } from 'react';

import CloseIcon from '@material-ui/icons/Close';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { useLocation } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';
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
  root: {
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  header: {
    marginBottom: theme.spacing(3),
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
  headerText: {
    paddingTop: '10px',
  },
  deprecatedTitle: {
    backgroundColor: theme.palette.warning.main,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.getContrastText(theme.palette.warning.main),
    padding: [[0, theme.spacing(1)]],
    position: 'absolute',
    right: 0,
    top: 12,
    transform: 'translateX(+105%)',
  },
  pageTitleWrapper: {
    margin: '0 auto',
    position: 'relative',
    width: 'max-content',
  },
}));
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const DatasetSummary = () => {
  const query = useQuery();
  const datasetId = query.get('dataset');
  const [deprecatedAlert, setDeprecatedAlert] = useState(false);
  const {
    dataset, datasetLoading, datasetError
  } = useDataset(datasetId);

  const classes = useStyles();
  const theme = useTheme();
  const mediumBreakpoint = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    document.title = 'Dataset Summary - Dojo';
  }, []);

  useEffect(() => {
    if (dataset?.deprecated) {
      setDeprecatedAlert(true);
    }
  }, [dataset]);

  if (!datasetId) {
    return (
      <LoadingOverlay
        text="There was an error loading the dataset summary"
        error
        link={{ href: '/datasets', text: 'Return to the list of all datasets' }}
      />
    );
  }

  if (datasetLoading) {
    return <LoadingOverlay text="Loading summary" />;
  }

  if (datasetError) {
    return (
      <LoadingOverlay
        text="There was an error loading the dataset summary"
        error={datasetError}
        link={{ href: '/datasets', text: 'Return to the list of all datasets' }}
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
        <div className={classes.pageTitleWrapper}>
          <Typography
            className={classes.header}
            variant="h4"
            align="center"
          >
            Dataset Summary
          </Typography>
          {dataset?.deprecated && (
            <Typography
              variant="subtitle2"
              component="div"
              className={classes.deprecatedTitle}
            >
              DEPRECATED
            </Typography>
          )}
        </div>
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
          <Grid item xs={12}>
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

        <BasicAlert
          alert={{
            message: 'This dataset has been deprecated.',
            severity: 'warning',
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={null}
          action={(
            <IconButton
              color="inherit"
              onClick={() => setDeprecatedAlert(false)}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          disableClickaway
          setVisible={setDeprecatedAlert}
          visible={deprecatedAlert}
        />
      </Container>
    </div>
  );
};

export default DatasetSummary;
