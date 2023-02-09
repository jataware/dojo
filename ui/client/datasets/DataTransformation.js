import React, { useState, useEffect } from 'react';

import axios from 'axios';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import ClipMap from './ClipMap';
import ClipTime from './ClipTime';
import Drawer from '../components/Drawer';
import { Navigation } from '.';
import ScaleTime from './ScaleTime';

export default withStyles(({ spacing }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],
  },
  header: {
    marginBottom: spacing(6),
  },
}))(({
  classes, annotations, datasetInfo, stepTitle, handleNext, handleBack, useFilepath = false, rawFileName, ...props
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [savedDrawings, setSavedDrawings] = useState([]);

  // useEffect(() => {
  //   // TODO do this by getting from cartwright process, for now mock lat/lng
  //   setMapBounds([['12', '40'], ['-44', '-15']]);
  // }, []);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerName(null);
  };

  const handleDrawerOpen = (name) => {
    setDrawerOpen(true);
    setDrawerName(name);
  };

  // useEffect(() => {
  //   console.log('this is saveDrawings', savedDrawings);
  // }, [savedDrawings]);

  useEffect(() => {
    const startBoundingBoxJob = async () => {
      const args = {
        geo_columns: [
          'latitude',
          'longitude',
        ],
      };
      const jobQueueResp = await axios.post(
        `/api/dojo/job/${datasetInfo.id}/mixmasta_processors.get_boundary_box`, args
      );

      if (jobQueueResp.status === 200) {
        return jobQueueResp.data?.id;
      }
    };

    // We need to fetch from mixmasta multiple times to get the bounding box job result
    const repeatFetch = (jobId) => {
      setTimeout(() => {
        axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
          console.log('fetching bounding box data...', response);
          if (response.status === 200) {
            if (response.data?.boundary_box) {
              const bObj = response.data?.boundary_box;
              const bounds = [[bObj.xmin, bObj.xmax], [bObj.ymin, bObj.ymax]];
              setMapBounds(bounds);
              return;
            }

            // if no data, try the fetch again
            repeatFetch(jobId);
          }
        }).catch(() => {
          // TODO: this is currently an endless loop - handle actual errors
          startBoundingBoxJob().then((resp) => {
            repeatFetch(resp);
          });
        });
      }, 500);
    };

    // only do this once we have the ID and if we don't already have bounds loaded
    if (datasetInfo.id) {
      if (!mapBounds) {
        startBoundingBoxJob().then((jobId) => {
          repeatFetch(jobId);
        });
      }
    }

    // TODO this won't work
    // return () => clearTimeout(repeatFetch);
  }, [datasetInfo.id, mapBounds]);

  // TODO: expand this to include the other data transformation steps as we do them
  const saveDrawings = async (drawings) => {
    const transformation = {
      'map-shapes': drawings,
      geo_columns: [
        'latitude',
        'longitude',
      ],
    };
    const jobQueueResp = await axios.post(
      `/api/dojo/job/${datasetInfo.id}/mixmasta_processors.clip_data`,
      transformation
    );

    if (jobQueueResp.status === 200) {
      const jobId = jobQueueResp.data.id;

      const transformationResp = await axios.post(`/api/dojo/job/fetch/${jobId}`);

      // TODO: currently job/fetch returns nothing (but no error)
      console.log('This is the transformation response', transformationResp);
    }
    // TODO: error handling
  };

  const drawerInner = () => {
    switch (drawerName) {
      case 'regridMap':
        return (
          <Typography align="center" variant="h5">Regrid Map Data</Typography>
        );
      case 'clipMap':
        return (
          <ClipMap
            mapBounds={mapBounds}
            saveDrawings={setSavedDrawings}
            savedDrawings={savedDrawings}
          />
        );
      case 'scaleTime':
        return (
          <ScaleTime />
        );
      case 'clipTime':
        return (
          <ClipTime />
        );
      default:
        return (
          <Typography align="center" variant="h5">
            Sorry, there was an error. Please try refreshing the page
          </Typography>
        );
    }
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="sm"
    >
      <Typography
        className={classes.header}
        variant="h4"
        align="center"
      >
        {stepTitle}
      </Typography>

      <Typography variant="h5" onClick={() => handleDrawerOpen('regridMap')}>Regrid Map Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('clipMap')}>Clip Map Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('scaleTime')}>Scale Temporal Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('clipTime')}>Clip Temporal Data</Typography>

      <Navigation
        label="Next"
        handleNext={handleNext}
        handleBack={handleBack}
      />

      <Drawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anchorPosition="right"
        noConfirm
        PaperProps={{ variant: 'outlined' }}
      >
        {drawerInner()}
      </Drawer>
    </Container>
  );
});
