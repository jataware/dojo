import React, { useState, useEffect } from 'react';

import axios from 'axios';

import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import TodayIcon from '@material-ui/icons/Today';
import CheckIcon from '@material-ui/icons/Check';
import GridOnIcon from '@material-ui/icons/GridOn';
import MapIcon from '@material-ui/icons/Map';

import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { withStyles, useTheme } from '@material-ui/core/styles';

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
  const theme = useTheme();

  // useEffect(() => {
  //   // TODO do this by getting from cartwright process, for now mock lat/lng
  //   setMapBounds([['12', '40'], ['-44', '-15']]);
  // }, []);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // delay this slightly so we don't get a flicker as the drawer closes
    setTimeout(() => setDrawerName(null), 400);
  };

  const handleDrawerOpen = (name) => {
    setDrawerOpen(true);
    setDrawerName(name);
  };

  useEffect(() => {
    // TODO: extract this and the following useEffect into a shared mixmasta repeat call function
    console.log('this is saveDrawings', savedDrawings);
    let timeout;
    const startProcessClippingsJob = async (drawings) => {
      const args = {
        'map-shapes': drawings,
        geo_columns: [
          'latitude',
          'longitude',
        ],
      };
      const jobQueueResp = await axios.post(
        `/api/dojo/job/${datasetInfo.id}/mixmasta_processors.clip_data`, args
      );

      if (jobQueueResp.status === 200) {
        return jobQueueResp.data?.id;
      }
    };

    const repeatFetch = (jobId) => {
      timeout = setTimeout(() => {
        axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
          if (response.status === 200) {
            console.log('this is the clippings response', response)
            if (response.data) {
              // TODO: do something with the response
              return;
            }
            // if no data, try the fetch again
            repeatFetch(jobId);
          }
        }).catch(() => {
          // TODO: this is currently an endless loop - handle actual errors
          console.log('repeating clippings job')
          startProcessClippingsJob().then((resp) => {
            repeatFetch(resp);
          });
        });
      }, 500);
    };

    if (datasetInfo.id && savedDrawings.length > 0) {
      startProcessClippingsJob().then((jobId) => repeatFetch(jobId));
    }
    return () => clearTimeout(timeout);
  }, [savedDrawings, datasetInfo.id]);

  useEffect(() => {
    let timeout;
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
      timeout = setTimeout(() => {
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

    return () => clearTimeout(timeout);
  }, [datasetInfo.id, mapBounds]);

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
            closeDrawer={handleDrawerClose}
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

      <List>
        <ListItem button>
          <ListItemIcon>
            <GridOnIcon
              fontSize="large"
              style={{
                color: theme.palette.text.primary
              }}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'h6' }} onClick={() => handleDrawerOpen('regridMap')}>Regrid Map Data</ListItemText>
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <MapIcon
              fontSize="large"
              style={{
                color: savedDrawings.length ? theme.palette.grey[500] : theme.palette.text.primary
              }}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('clipMap')}
            style={{
              color: savedDrawings.length ? theme.palette.grey[500] : theme.palette.text.primary
            }}
          >
            Clip Map Data
          </ListItemText>
          {savedDrawings.length !== 0 && (
            <ListItemIcon>
              <CheckIcon style={{ color: theme.palette.success.light }} fontSize="large" />
            </ListItemIcon>
          )}
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <AspectRatioIcon
              fontSize="large"
              style={{
                color: theme.palette.text.primary
              }}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'h6' }} onClick={() => handleDrawerOpen('scaleTime')}>Scale Temporal Data</ListItemText>
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <TodayIcon
              fontSize="large"
              style={{
                color: theme.palette.text.primary
              }}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'h6' }} onClick={() => handleDrawerOpen('clipTime')}>Clip Temporal Data</ListItemText>
        </ListItem>
      </List>
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
