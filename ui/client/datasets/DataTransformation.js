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
import AdjustResolution from './AdjustResolution';

const mixmastaJob = (datasetId, requestArgs, jobString, data, onSuccess) => {
  const startJob = async () => {
    const jobQueueResp = await axios.post(
      `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
    );

    if (jobQueueResp.status === 200) {
      return jobQueueResp.data?.id;
    }
  };

  const repeatFetch = (jobId) => {
    setTimeout(() => {
      axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
        if (response.status === 200) {
          console.log(`the response in mixmastaJob  with job string: ${jobString}:`, response);
          if (response.data) {
            console.log('success! no more calls?', response.data)
            onSuccess(response.data);
            return;
          }
          // if no data, try the fetch again
          repeatFetch(jobId);
        }
      }).catch(() => {
        // TODO: this is currently an endless loop - handle actual errors
        console.log('repeating job call')
        startJob().then((resp) => {
          repeatFetch(resp);
        });
      });
    }, 500);
  };

  if (datasetId) {
    startJob().then((jobId) => repeatFetch(jobId));
  }
};

export default withStyles(({ spacing }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],
  },
  header: {
    marginBottom: spacing(6),
  },

}))(({
  classes,
  datasetInfo,
  stepTitle,
  handleNext,
  handleBack,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapResolution, setMapResolution] = useState(null);
  const [mapResolutionOptions, setMapResolutionOptions] = useState([]);
  const [timeResolution, setTimeResolution] = useState(null);
  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [timeBounds, setTimeBounds] = useState([]);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const [disableDrawerClose, setDisableDrawerClose] = useState(false);
  const theme = useTheme();

// TODO remove the following, just for development
  if (!mapBounds) {
    setMapBounds([['12', '40'], ['-44', '-15']]);
  }
  if (!mapResolution) {
    setTimeout(() => {
      setMapResolution('1m');

      setMapResolutionOptions(['10m', '50m', '100m', '500m', '1km', '10km']);
    }, 2000);
  }
  if (!mapResolution) {
    setTimeout(() => {
      setTimeResolution('day');

      setTimeResolutionOptions(['week', 'fortnight', 'month', 'year', 'decade']);
    }, 2000);
  }
  if (!timeBounds.length) {
    // setTimeout(() => {
      setTimeBounds([
        '2020-01-22',
        '2020-03-01',
        '2020-05-02',
        '2020-07-03',
        '2020-12-08',
        '2021-01-12',
        '2021-04-15',
        '2021-06-03',
        '2021-12-08',
        '2022-01-12',
        '2022-07-15',
      ]);
    // }, 3000);
  }
// to here

  // Fetches the mapBounds for the ClipMap component
  useEffect(() => {
    if (!mapBounds) {
      const args = {
        geo_columns: [
          'latitude',
          'longitude',
        ],
      };
      const jobString = 'mixmasta_processors.get_boundary_box';

      const onSuccess = (data) => {
        if (data?.boundary_box) {
          const bObj = data?.boundary_box;
          const bounds = [[bObj.xmin, bObj.ymin], [bObj.xmax, bObj.ymax]];
          setMapBounds(bounds);
        }
      };
      mixmastaJob(datasetInfo.id, args, jobString, mapBounds, onSuccess);
    }
  }, [datasetInfo.id, mapBounds]);

  const handleDrawerClose = (bool, event) => {
    // prevent clicking outside the drawer to close
    if (event?.target.className === 'MuiBackdrop-root') return;
    // if the contents of the drawer are telling us to disable closing, do nothing
    if (disableDrawerClose) return;

    setDrawerOpen(false);
    // delay this slightly so we don't get a flicker as the drawer closes
    setTimeout(() => setDrawerName(null), 400);
  };

  const handleDrawerOpen = (name) => {
    setDrawerOpen(true);
    setDrawerName(name);
  };

  const processClippings = () => {
    if (savedDrawings.length > 0) {
      const args = {
        map_shapes: savedDrawings,
        geo_columns: [
          'latitude',
          'longitude',
        ],
      };
      mixmastaJob(datasetInfo.id, args, 'mixmasta_processors.clip_geo', savedDrawings, () => {});
    }
  };

  const handleNextStep = () => {
    processClippings();
    handleNext();
  };

  const drawerInner = () => {
    switch (drawerName) {
      case 'regridMap':
        return (
          <AdjustResolution
            closeDrawer={handleDrawerClose}
            oldResolution={mapResolution}
            resolutionOptions={mapResolutionOptions}
            title="Adjust Geospatial Resolution"
          />
        );
      case 'clipMap':
        return (
          <ClipMap
            mapBounds={mapBounds}
            saveDrawings={setSavedDrawings}
            savedDrawings={savedDrawings}
            closeDrawer={handleDrawerClose}
            disableDrawerClose={disableDrawerClose}
            setDisableDrawerClose={setDisableDrawerClose}
          />
        );
      case 'scaleTime':
        return (
          <AdjustResolution
            closeDrawer={handleDrawerClose}
            oldResolution={timeResolution}
            resolutionOptions={timeResolutionOptions}
            title="Adjust Temporal Resolution"
          />
        );
      case 'clipTime':
        return (
          <ClipTime timeBounds={timeBounds} />
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
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('regridMap')}
          >
            Adjust Geospatial Resolution
          </ListItemText>
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
            Select Geospatial Coverage
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
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('scaleTime')}
          >
            Adjust Temporal Resolution
          </ListItemText>
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
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('clipTime')}
          >
            Select Temporal Coverage
          </ListItemText>
        </ListItem>
      </List>
      <Navigation
        label="Next"
        handleNext={handleNextStep}
        handleBack={handleBack}
      />

      <Drawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anchorPosition="right"
        noConfirm
        PaperProps={{ variant: 'outlined' }}
        wide
        variant="temporary"
      >
        {drawerInner()}
      </Drawer>
    </Container>
  );
});
