import React, {
  useCallback, useEffect, useRef, useState
} from 'react';

import axios from 'axios';

import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import InfoIcon from '@material-ui/icons/Info';
import TodayIcon from '@material-ui/icons/Today';
import CheckIcon from '@material-ui/icons/Check';
import GridOnIcon from '@material-ui/icons/GridOn';
import MapIcon from '@material-ui/icons/Map';

import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import ClipMap from './ClipMap';
import ClipTime from './ClipTime';
import Drawer from '../components/Drawer';
import { Navigation } from '.';
import AdjustTemporalResolution from './AdjustTemporalResolution';
import AdjustGeoResolution from './AdjustGeoResolution';

const TransformationButton = withStyles(({ palette }) => ({
  complete: {
    color: palette.grey[500],
  },
  incomplete: {
    color: palette.text.primary,
  },
  check: {
    color: palette.success.light,
  },
  close: {
    color: palette.info.light,
  },
  disabled: {
    color: palette.text.disabled,
  },
  listItemIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
}))(({
  classes,
  isComplete,
  Icon,
  title,
  onClick,
  loading,
  failed,
}) => {
  const displayIcon = () => {
    if (isComplete) {
      return <CheckIcon className={classes.check} fontSize="large" />;
    }

    if (loading) {
      return <CircularProgress thickness={4.5} size={25} />;
    }

    // TODO: change name from failed to something else?
    if (failed) {
      return <InfoIcon className={classes.close} fontSize="large" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <ListItem button disabled={loading || failed}>
        <ListItemIcon>
          <Icon
            fontSize="large"
            className={isComplete ? classes.complete : classes.incomplete}
          />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ variant: 'h6' }}
          onClick={onClick}
          className={isComplete ? classes.complete : classes.incomplete}
        >
          {title}
        </ListItemText>
        <ListItemIcon className={classes.listItemIcon}>
          {displayIcon()}
        </ListItemIcon>
      </ListItem>

    </div>
  );
});

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
  disabled: {
    color: palette.text.disabled,
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
  const [mapBoundsLoading, setMapBoundsLoading] = useState(false);
  const [mapBoundsError, setMapBoundsError] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);

  const [mapResolution, setMapResolution] = useState(null);
  const [mapResolutionLoading, setMapResolutionLoading] = useState(false);
  const [mapResolutionOptions, setMapResolutionOptions] = useState([]);
  const [savedMapResolution, setSavedMapResolution] = useState(null);

  const [timeResolution, setTimeResolution] = useState(null);
  const [timeResolutionLoading, setTimeResolutionLoading] = useState(false);
  const [timeResolutionError, setTimeResolutionError] = useState(false);
  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [savedTimeResolution, setSavedTimeResolution] = useState(null);
  const [savedAggregation, setSavedAggregation] = useState(null);

  const [timeBounds, setTimeBounds] = useState([]);
  const [timeBoundsLoading, setTimeBoundsLoading] = useState(false);
  const [timeBoundsError, setTimeBoundsError] = useState(false);
  const [savedTimeBounds, setSavedTimeBounds] = useState(null);
  const cleanupRef = useRef(null);

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
  // }
// to here

  const startElwoodJob = useCallback(async (datasetId, requestArgs, jobString) => {
    const jobQueueResp = await axios.post(
      `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
    );

    if (jobQueueResp.status === 200) {
      return jobQueueResp.data?.id;
    }
  }, []);

  const runElwoodJob = useCallback((datasetId, requestArgs, jobString, onSuccess, onFailure) => {
    console.log('runElwoodJob has been called at the top level');
    let count = 0;

    const repeatFetch = (jobId) => {
      setTimeout(() => {
        axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
          if (response.status === 200) {
            // keep track of how long it takes (for dev purposes)
            count += 1;
            console.log(`${count}: response from job string: ${jobString}:`, response);
            if (response.data) {
              console.log(`success! it took ${count * 500}ms`, response.data);
              onSuccess(response.data);
              return;
            }
            if (cleanupRef.current) {
              // if no data and the component is mounted, try the fetch again
              repeatFetch(jobId);
            }
          }
        }).catch(() => {
          // we get a 404 immediately - there is some sort of bug, this accounts for that
          if (count < 2 && cleanupRef.current) {
            // and the component is mounted
            console.log('repeating job call');
            startElwoodJob(datasetId, requestArgs, jobString).then((resp) => {
              repeatFetch(resp);
            });
          } else {
            if (onFailure) {
              onFailure();
            }
          }
        });
      }, 500);
    };

    if (datasetId) {
      startElwoodJob(datasetId, requestArgs, jobString).then((jobId) => repeatFetch(jobId));
    }
  }, [startElwoodJob]);

  // TODO: Disabled until the transformation_processors.regrid_geo job is working properly
  // // fetch resolution for AdjustGeoResolution component
  // useEffect(() => {
  //   if (!mapResolution && !mapResolutionLoading) {
  //     if (annotations?.annotations?.geo) {
  //       setMapResolutionLoading(true);
  //       const args = {};
  //       annotations.annotations.geo.forEach((geo) => {
  //         if (geo.geo_type === 'latitude') {
  //           args.lat_column = geo.name;
  //         } else {
  //           args.lon_column = geo.name;
  //         }
  //       });

  //       const geoResolutionString = 'resolution_processors.calculate_geographical_resolution';
  //       const onGeoResolutionSuccess = (data) => {
  //         console.log('this is the calculate_geographical_resolution response:', data);
  //         if (data.resolution_result?.uniformity === 'PERFECT') {
  //           setMapResolution(data.scale_km);
  //         } else {
  //           setMapResolution('None');
  //         }
  //         if (data.multiplier_samples) {
  //           setMapResolutionOptions(data.multiplier_samples);
  //         }
  //         setMapResolutionLoading(false);
  //       };

  //       runElwoodJob(datasetInfo.id, args, geoResolutionString, onGeoResolutionSuccess);
  //     }
  //   }
  // }, [datasetInfo.id, annotations, mapResolution, mapResolutionLoading, runElwoodJob]);

  // fetch boundary for ClipMap component
  useEffect(() => {
    if (!mapBounds && !mapBoundsError && !mapBoundsLoading) {
      if (annotations?.annotations?.geo) {
        setMapBoundsLoading(true);
        const args = { geo_columns: [] };
        annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

        const geoBoundaryString = 'transformation_processors.get_boundary_box';
        const onGeoBoundarySuccess = (data) => {
          if (data?.boundary_box) {
            const bObj = data?.boundary_box;
            // only do this if we have the lat/lon, otherwise it is returning a failure
            if (bObj.ymin && bObj.xmin) {
              const bounds = [[bObj.ymin, bObj.xmin], [bObj.ymax, bObj.xmax]];
              setMapBounds(bounds);
            }
            if (Object.keys(data.boundary_box).length === 0) {
              setMapBoundsError(true);
            }
            setMapBoundsLoading(false);
          }
        };

        const onGeoBoundaryFailure = () => {
          setMapBoundsError(true);
          setMapBoundsLoading(false);
        };

        runElwoodJob(
          datasetInfo.id,
          args,
          geoBoundaryString,
          onGeoBoundarySuccess,
          onGeoBoundaryFailure
        );
      }
    }
  }, [datasetInfo.id, annotations, mapBounds, mapBoundsLoading, runElwoodJob, mapBoundsError]);

  // fetch resolution for AdjustTemporalResolution component
  useEffect(() => {
    if (!timeResolution && !timeResolutionLoading && !timeResolutionError) {
      if (annotations?.annotations?.date) {
        setTimeResolutionLoading(true);
        const args = {
          datetime_column: annotations.annotations.date[0].name,
          time_format: annotations.annotations.date[0].time_format,
        };

        const temporalResolutionString = 'resolution_processors.calculate_temporal_resolution';
        const onTemporalResolutionSuccess = (data) => {
          if (data.resolution_result?.uniformity !== 'PERFECT') {
            setTimeResolutionError(true);
          } else {
            setTimeResolution(data.resolution_result);
          }
          setTimeResolutionLoading(false);
        };

        const onTemporalResolutionFailure = () => {
          setTimeResolutionError(true);
          setTimeResolutionLoading(false);
        };

        runElwoodJob(
          datasetInfo.id,
          args,
          temporalResolutionString,
          onTemporalResolutionSuccess,
          onTemporalResolutionFailure,
        );
      }
    }
  }, [
    datasetInfo.id,
    annotations,
    timeResolution,
    timeResolutionLoading,
    runElwoodJob,
    timeResolutionError
  ]);

  // fetch time bounds for ClipTime component
  useEffect(() => {
    if (!timeBounds.length && !timeBoundsLoading && !timeBoundsError) {
      if (annotations?.annotations?.date) {
        setTimeBoundsLoading(true);
        const args = {
          datetime_column: annotations.annotations.date[0].name,
          time_format: annotations.annotations.date[0].time_format,
        };

        const getDatesString = 'transformation_processors.get_unique_dates';
        const onGetDatesSuccess = (data) => {
          if (data.unique_dates.length) {
            setTimeBounds(data.unique_dates);
          } else {
          // TODO: also handle single length arrays as an error/un-transformable?
            setTimeBoundsError(true);
          }
          setTimeBoundsLoading(false);
        };

        const onGetDatesFailure = () => {
          setTimeBoundsError(true);
          setTimeBoundsLoading(false);
        };

        runElwoodJob(datasetInfo.id, args, getDatesString, onGetDatesSuccess, onGetDatesFailure);
      }
    }
  }, [
    datasetInfo.id,
    annotations,
    timeBounds,
    timeBoundsLoading,
    runElwoodJob,
    timeBoundsError
  ]);

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

      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.regrid_geo');
    }
  };

  const processMapClippings = () => {
    if (savedDrawings.length > 0) {
      const args = {
        map_shapes: savedDrawings,
        geo_columns: [],
      };
      annotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));

      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_geo');
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

      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_time');
    }
  };

  const processAdjustTime = () => {
    if (savedTimeResolution) {
      const args = {
        datetime_column: annotations.annotations.date[0].name,
        datetime_bucket: savedTimeResolution.alias,
        aggregation_function_list: [savedAggregation],
      };

      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.scale_time');
    }
  };

  const handleNextStep = () => {
    // const adjustGeo = processAdjustGeo();
    const clipMap = processMapClippings();
    const adjustTime = processAdjustTime();
    const clipTime = processClipTime();
    Promise.all([clipMap, adjustTime, clipTime]).then(() => {
      // only do the next step after we've kicked off the jobs
      // and heard back that they have started
      handleNext();
    });
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
      ref={cleanupRef}
    >
      <Typography
        className={classes.header}
        variant="h4"
        align="center"
      >
        {stepTitle}
      </Typography>

      <List>
        <Tooltip
          title="This feature is a work in progress and is not yet available"
          arrow
          placement="top"
        >
          {/*<TransformationButton
            isComplete={!!savedMapResolution}
            Icon={GridOnIcon}
            title="Adjust Geospatial Resolution"
            onClick={() => handleDrawerOpen('regridMap')}
          />*/}
          <ListItem button>
            <ListItemIcon>
              <GridOnIcon
                fontSize="large"
                // className={savedMapResolution ? classes.complete : classes.incomplete}
                className={classes.disabled}
              />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ variant: 'h6' }}
              // onClick={() => handleDrawerOpen('regridMap')}
              // className={savedMapResolution ? classes.complete : classes.incomplete}
              className={classes.disabled}
            >
              Adjust Geospatial Resolution
            </ListItemText>
            {savedMapResolution && (
              <ListItemIcon>
                <CheckIcon className={classes.check} fontSize="large" />
              </ListItemIcon>
            )}
          </ListItem>
        </Tooltip>

        <TransformationButton
          isComplete={!!savedDrawings.length}
          Icon={MapIcon}
          title="Select Geospatial Coverage"
          onClick={() => handleDrawerOpen('clipMap')}
          loading={mapBoundsLoading}
          failed={mapBoundsError}
        />

        <TransformationButton
          isComplete={!!savedTimeResolution}
          Icon={AspectRatioIcon}
          title="Adjust Temporal Resolution"
          onClick={() => handleDrawerOpen('scaleTime')}
          loading={timeResolutionLoading}
          failed={timeResolutionError}
        />

        <TransformationButton
          isComplete={!!savedTimeBounds}
          Icon={TodayIcon}
          title="Select Temporal Coverage"
          onClick={() => handleDrawerOpen('clipTime')}
          loading={timeBoundsLoading}
          failed={timeBoundsError}
        />
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
