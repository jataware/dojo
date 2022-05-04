import React, { useState } from 'react';

import axios from 'axios';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import BasicAlert from './BasicAlert';
import CollapseText from './CollapseText';
import ConfirmDialog from './ConfirmDialog';
import CountryMap from './CountryMap';
import { useDataset } from './SWRHooks';

const useStyles = makeStyles((theme) => ({
  buttonStyle: {
    border: '2px solid black',
    backgroundColor: 'white',
    color: 'black',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
  },

  detailsPanel: {
    padding: theme.spacing(2),
  },
  subsection: {
    marginLeft: theme.spacing(1),
  },
  modelHeader: {
    fontWeight: 'bold',
    padding: theme.spacing(1),
    textAlign: 'center',

  },
  tablePanel: {
    align: 'center',
    padding: theme.spacing(2),
  },
  buttonWrapper: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

function DatasetSummaryDetails({ dataset }) {
  const classes = useStyles();
  const [confirmDeprecateOpen, setConfirmDeprecateOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ message: '', severity: '' });
  const { mutateDataset } = useDataset(dataset.id);

  const handleDeprecateClick = () => {
    setConfirmDeprecateOpen(true);
  };

  const acceptDeprecate = () => {
    axios.put(`/api/dojo/indicators/${dataset.id}/deprecate`)
      .then((resp) => {
        console.info('Successfully deprecated the dataset:', resp);
        setAlertMessage({
          message: 'Your dataset was successfully deprecated.', severity: 'success'
        });
        setAlertOpen(true);
        setConfirmDeprecateOpen(false);
        // update dataset.deprecated to true, and tell the dataset to not re-fetch from the server
        // as it might not have updated yet (ES is slow)
        mutateDataset({ ...dataset, deprecated: true }, false);
      })
      .catch((err) => {
        console.error('There was an error deprecating the dataset:', err);
        setAlertMessage({
          message: 'There was an issue deprecating your dataset.', severity: 'error'
        });
        setAlertOpen(true);
        setConfirmDeprecateOpen(false);
      });
  };

  // no need to spread the following out onto a million lines
  /* eslint-disable react/jsx-one-expression-per-line */
  return (
    <Grid container>
      <Grid item xs={4}>
        <div className={classes.detailsPanel}>

          <Typography variant="subtitle1" className={classes.modelHeader}>
            Overview
          </Typography>
          <Typography variant="body2" className={classes.subsection}>
            <b> Name:</b> {dataset.name}
          </Typography>
          <Typography component="div" variant="body2" className={classes.subsection}>
            <div style={{ maxWidth: '300px' }}>
              <b>  Website: </b>
              <CollapseText childrenText={dataset.maintainer?.website} collapsedSize={20} />
            </div>
          </Typography>
          <Typography variant="body2" className={classes.subsection}>
            <b>  Family: </b> {dataset.family_name}
          </Typography>

          <Typography component="div" variant="body2" className={classes.subsection}>
            <b> Description: </b>
            <CollapseText childrenText={dataset.description} collapsedSize={40} />
          </Typography>
          <Typography variant="body2" className={classes.subsection}>
            <b> Created Date: </b> {new Date(dataset.created_at).toLocaleDateString()}
          </Typography>

          <Typography variant="body2" className={classes.subsection}>
            <b> ID: </b> {dataset.id}
          </Typography>
          <br />
          <Typography variant="body2" className={classes.buttonWrapper}>
            <Button
              variant="outlined"
              color="primary"
              disableElevation
              href={`https://causemos.uncharted.software/#/dataset/${dataset.id}/datasetOverview`}
              target="_blank"
              rel="noopener"
            >
              View In Causemos
            </Button>
          </Typography>
          <Typography variant="body2" className={classes.buttonWrapper}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleDeprecateClick}
              disableElevation
              disabled={dataset.deprecated}
            >
              {dataset.deprecated ? 'Deprecated' : 'Deprecate Dataset'}
            </Button>
          </Typography>
        </div>
      </Grid>
      <Grid className={classes.detailsPanel} item xs={3}>
        <Typography variant="subtitle1" className={classes.modelHeader}>
          Maintainer
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          <b>  Name: </b> {dataset.maintainer?.name}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          <b>  Email: </b>  {dataset.maintainer?.email}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          <b>  Organization: </b> {dataset.maintainer?.organization}
        </Typography>
        <Typography variant="subtitle1" className={classes.modelHeader}>
          <b>  Categories </b>
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          {dataset.category?.join(', ')}
        </Typography>

      </Grid>

      <Grid className={classes.tablePanel} item xs={5}>
        <Typography variant="subtitle1" className={classes.modelHeader}>
          Geography
        </Typography>
        <CountryMap dataset={dataset} />
      </Grid>

      <ConfirmDialog
        open={confirmDeprecateOpen}
        accept={acceptDeprecate}
        reject={() => setConfirmDeprecateOpen(false)}
        title="Are you sure you want to deprecate this dataset?"
        body="You will need to create a new version if you wish to continue using this dataset."
      />
      <BasicAlert
        alert={alertMessage}
        visible={alertOpen}
        setVisible={setAlertOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />

    </Grid>

  );
}

export default DatasetSummaryDetails;
