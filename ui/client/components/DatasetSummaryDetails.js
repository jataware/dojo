import React from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import CollapseText from './CollapseText';
import CountryMap from './CountryMap';
import CSVDownload from './CSVDownload';

const useStyles = makeStyles()((theme) => ({
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

const DatasetSummaryDetails = ({ dataset }) => {
  const { classes } = useStyles();

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
              href={`${process.env.CAUSEMOS_UI_URL}/#/dataset/${dataset.id}/datasetOverview`}
              target="_blank"
              rel="noopener"
            >
              View In Causemos
            </Button>
          </Typography>

          <div style={{ marginLeft: '8px' }}>
            <CSVDownload resource={dataset} />
          </div>
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
    </Grid>
  );
};

export default DatasetSummaryDetails;
