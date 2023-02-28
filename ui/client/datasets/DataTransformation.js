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
import AdjustTemporalResolution from './AdjustTemporalResolution';
import AdjustGeoResolution from './AdjustGeoResolution';

const runElwoodJob = (datasetId, requestArgs, jobString, onSuccess) => {
  let count = 0;
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
          // keep track of how long it takes (for dev purposes)
          count += 1;
          console.log(`${count}: the response in startJob  with job string: ${jobString}:`, response);
          if (response.data) {
            console.log(`success! it took ${count * 500}ms`, response.data)
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

export default withStyles(({ spacing, palette }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],
  },
  header: {
    marginBottom: spacing(6),
  },
  complete: {
    color: palette.grey[500],
  },
  incomplete: {
    color: palette.text.primary,
  },
  check: {
    color: palette.success.light,
  },
}))(({
  classes,
  datasetInfo,
  stepTitle,
  handleNext,
  handleBack,
  annotations,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [disableDrawerClose, setDisableDrawerClose] = useState(false);

  const [mapBounds, setMapBounds] = useState(null);
  const [savedDrawings, setSavedDrawings] = useState([]);

  const [mapResolution, setMapResolution] = useState(null);
  const [mapResolutionOptions, setMapResolutionOptions] = useState([]);
  const [savedMapResolution, setSavedMapResolution] = useState(null);

  const [timeResolution, setTimeResolution] = useState(null);
  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [savedTimeResolution, setSavedTimeResolution] = useState(null);
  const [savedAggregation, setSavedAggregation] = useState(null);

  const [timeBounds, setTimeBounds] = useState([]);
  const [savedTimeBounds, setSavedTimeBounds] = useState(null);

  // until we get the list of timeresoptions from the backend:
  if (!timeResolutionOptions.length) {
    setTimeResolutionOptions([
      { alias: 'L', description: 'milliseconds' },
      { alias: 'S', description: 'secondly' },
      { alias: 'T', description: 'minutely' },
      { alias: 'H', description: 'hourly' },
      { alias: 'D', description: 'day' },
      { alias: 'W', description: 'weekly' },
      { alias: 'M', description: 'month end' },
      { alias: 'Q', description: 'quarter end' },
      { alias: 'Y', description: 'year end' },
    ]);
  }

// TODO the following are just for speeding up development
  // if (!mapBounds) {
  //   setMapBounds([['12', '40'], ['-44', '-15']]);
  // }

  // if (!timeResolution) {
  //   setTimeResolution({
  //     uniformity: 'PERFECT',
  //     unit: 'month',
  //     resolution: 1,
  //     error: 1.7832238693938827
  //   });
  // }

  // if (!mapResolutionOptions.length) {
  //   setMapResolutionOptions([
  //     222.00000000000028,
  //     333.00000000000045,
  //     444.00000000000057,
  //     555.0000000000007,
  //     666.0000000000009,
  //   ]);
  // }
  // if (!mapResolution) {
  //   setMapResolution(111.00000000000014);
  // }

  // if (!timeBounds.length) {
  //   // setTimeout(() => {
  //     setTimeBounds([
  //       '2020-01-22',
  //       '2020-03-01',
  //       '2020-05-02',
  //       '2020-07-03',
  //       '2020-12-08',
  //       '2021-01-12',
  //       '2021-04-15',
  //       '2021-06-03',
  //       '2021-12-08',
  //       '2022-01-12',
  //       '2022-07-15',
  //     ]);
  //   // }, 3000);
  // }
// to here

  // fetch resolution for AdjustGeoResolution component
  useEffect(() => {
    if (!mapResolution) {
      if (annotations?.annotations?.geo) {
        const args = {};
        annotations.annotations.geo.forEach((geo) => {
          if (geo.geo_type === 'latitude') {
            args.lat_column = geo.name;
          } else {
            args.lon_column = geo.name;
          }
        });

        const geoResolutionString = 'resolution_processors.calculate_geographical_resolution';
        const onGeoResolutionSuccess = (data) => {
          console.log('this is the calculate_geographical_resolution response:', data);
          if (data.resolution_result?.uniformity === 'PERFECT') {
            setMapResolution(data.scale_km);
          } else {
            setMapResolution('None');
          }
          if (data.multiplier_samples) {
            setMapResolutionOptions(data.multiplier_samples);
          }
        };

        runElwoodJob(datasetInfo.id, args, geoResolutionString, onGeoResolutionSuccess);
      }
    }
  }, [datasetInfo.id, annotations, mapResolution]);

  // fetch boundary for ClipMap component
  useEffect(() => {
    if (!mapBounds) {
      if (annotations?.annotations?.geo) {
        const args = { geo_columns: [] };
        annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

        const geoBoundaryString = 'transformation_processors.get_boundary_box';
        const onGeoBoundarySuccess = (data) => {
          if (data?.boundary_box) {
            const bObj = data?.boundary_box;
            const bounds = [[bObj.xmin, bObj.ymin], [bObj.xmax, bObj.ymax]];
            setMapBounds(bounds);
          }
        };

        runElwoodJob(datasetInfo.id, args, geoBoundaryString, onGeoBoundarySuccess);
      }
    }
  }, [datasetInfo.id, annotations, mapBounds]);

  // fetch resolution for AdjustTemporalResolution component
  useEffect(() => {
    if (!timeResolution) {
      if (annotations?.annotations?.date) {
        const args = {
          datetime_column: annotations.annotations.date[0].name,
          time_format: annotations.annotations.date[0].time_format,
        };

        const temporalResolutionString = 'resolution_processors.calculate_temporal_resolution';
        const onTemporalResolutionSuccess = (data) => {
          if (data.resolution_result) {
            setTimeResolution(data.resolution_result);
          }
        };

        runElwoodJob(datasetInfo.id, args, temporalResolutionString, onTemporalResolutionSuccess);
      }
    }
  }, [datasetInfo.id, annotations, timeResolution]);

  // fetch time bounds for ClipTime component
  useEffect(() => {
    if (!timeBounds.length) {
      if (annotations?.annotations?.date) {
        const args = {
          datetime_column: annotations.annotations.date[0].name,
          time_format: annotations.annotations.date[0].time_format,
        };

        const getDatesString = 'transformation_processors.get_unique_dates';
        const onGetDatesSuccess = (data) => {
          if (data.unique_dates) {
            setTimeBounds(data.unique_dates);
          }
        };

        runElwoodJob(datasetInfo.id, args, getDatesString, onGetDatesSuccess);
      }
    }
  }, [datasetInfo.id, annotations, timeBounds]);

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

  const processAdjustGeo = () => {
    if (savedMapResolution) {
      const args = {
        geo_columns: [],
        scale_multi: savedMapResolution,
        scale: mapResolution,
      };
      annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

      runElwoodJob(datasetInfo.id, args, 'transformation_processors.regrid_geo', (resp) => {
        console.log('this is the adjust geo response', resp);
      });
    }
  };

  const processMapClippings = () => {
    if (savedDrawings.length > 0) {
      const args = {
        map_shapes: savedDrawings,
        geo_columns: [],
      };
      annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

      runElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_geo', () => {});
    }
  };

  const processClipTime = () => {
    if (savedTimeBounds) {
      const args = {
        datetime_column: annotations.annotations.date[0].name,
        time_ranges: [{
          start: savedTimeBounds[0], end: savedTimeBounds[savedTimeBounds.length - 1]
        }],
      };

      runElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_time', (resp) => {
        console.log('this is resp', resp);
      });
    }
  };

  const processAdjustTime = () => {
    if (savedTimeResolution) {
      const args = {
        datetime_column: annotations.annotations.date[0].name,
        datetime_bucket: savedTimeResolution.alias,
        aggregation_function_list: [savedAggregation],
      };

      runElwoodJob(datasetInfo.id, args, 'transformation_processors.scale_time', (resp) => {
        console.log('this is resp', resp);
      });
    }
  };

  const handleNextStep = () => {
    processAdjustGeo();
    processMapClippings();
    processAdjustTime();
    processClipTime();
    handleNext();
  };

  const drawerInner = () => {
    switch (drawerName) {
      case 'regridMap':
        return (
          <AdjustGeoResolution
            closeDrawer={handleDrawerClose}
            oldResolution={mapResolution}
            resolutionOptions={mapResolutionOptions}
            setSavedResolution={setSavedMapResolution}
            savedResolution={savedMapResolution}
            title="Geospatial"
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
          <AdjustTemporalResolution
            closeDrawer={handleDrawerClose}
            oldResolution={timeResolution}
            resolutionOptions={timeResolutionOptions}
            setSavedResolution={setSavedTimeResolution}
            savedResolution={savedTimeResolution}
            savedAggregation={savedAggregation}
            setSavedAggregation={setSavedAggregation}
            title="Temporal"
          />
        );
      case 'clipTime':
        return (
          <ClipTime
            timeBounds={timeBounds}
            savedTimeBounds={savedTimeBounds}
            setSavedTimeBounds={setSavedTimeBounds}
            closeDrawer={handleDrawerClose}
          />
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
              className={savedMapResolution ? classes.complete : classes.incomplete}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('regridMap')}
            className={savedMapResolution ? classes.complete : classes.incomplete}
          >
            Adjust Geospatial Resolution
          </ListItemText>
          {savedMapResolution && (
            <ListItemIcon>
              <CheckIcon className={classes.check} fontSize="large" />
            </ListItemIcon>
          )}
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <MapIcon
              fontSize="large"
              className={savedDrawings.length ? classes.complete : classes.incomplete}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('clipMap')}
            className={savedDrawings.length ? classes.complete : classes.incomplete}
          >
            Select Geospatial Coverage
          </ListItemText>
          {savedDrawings.length !== 0 && (
            <ListItemIcon>
              <CheckIcon className={classes.check} fontSize="large" />
            </ListItemIcon>
          )}
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <AspectRatioIcon
              fontSize="large"
              className={savedTimeResolution ? classes.complete : classes.incomplete}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('scaleTime')}
            className={savedTimeResolution ? classes.complete : classes.incomplete}
          >
            Adjust Temporal Resolution
          </ListItemText>
          {savedTimeResolution && (
            <ListItemIcon>
              <CheckIcon className={classes.check} fontSize="large" />
            </ListItemIcon>
          )}
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <TodayIcon
              fontSize="large"
              className={savedTimeBounds ? classes.complete : classes.incomplete}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            onClick={() => handleDrawerOpen('clipTime')}
            className={savedTimeBounds ? classes.complete : classes.incomplete}
          >
            Select Temporal Coverage
          </ListItemText>
          {savedTimeBounds && (
            <ListItemIcon>
              <CheckIcon className={classes.check} fontSize="large" />
            </ListItemIcon>
          )}
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
