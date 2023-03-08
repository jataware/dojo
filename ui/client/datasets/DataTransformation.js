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

// Hook that handles all the data fetching from Elwood
const useElwoodData = ({
  datasetId,
  annotations,
  onSuccess,
  generateArgs,
  jobString,
  cleanupRef,
}) => {
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    const startElwoodJob = async ({ requestArgs }) => {
      const jobQueueResp = await axios.post(
        `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
      );

      if (jobQueueResp.status === 200) {
        return jobQueueResp.data?.id;
      }
    };

    const runElwoodJob = ({ requestArgs, onFailure }) => {
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
                onSuccess(response.data, setData, setDataError, setDataLoading);
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
              startElwoodJob({ requestArgs }).then((resp) => {
                repeatFetch(resp);
              });
            } else {
              onFailure();
            }
          });
        }, 500);
      };

      if (datasetId) {
        startElwoodJob(datasetId, requestArgs, jobString).then((jobId) => repeatFetch(jobId));
      }
    };

    if (!data && !dataError && !dataLoading) {
      if (Object.keys(annotations?.annotations).length) {
        // don't do any of the below until annotations has been populated
        setDataLoading(true);
        const args = generateArgs(annotations);
        const onFailure = () => {
          setDataError(true);
          setDataLoading(false);
        };

        runElwoodJob({
          requestArgs: args,
          onFailure,
        });
      }
    }
    // The linter is complaining about cleanupRef missing here because it doesn't understand
    // that this is a reference to a ref, which both won't and shouldn't trigger a rerender
  }, [
    datasetId,
    annotations,
    jobString,
    data,
    dataError,
    dataLoading,
    generateArgs,
    onSuccess,
  ]);

  return { data, error: dataError };
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

  const [savedDrawings, setSavedDrawings] = useState([]);

  const [mapResolution, setMapResolution] = useState(null);
  const [mapResolutionLoading, setMapResolutionLoading] = useState(false);
  const [mapResolutionOptions, setMapResolutionOptions] = useState([]);
  const [savedMapResolution, setSavedMapResolution] = useState(null);

  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [savedTimeResolution, setSavedTimeResolution] = useState(null);
  const [savedAggregation, setSavedAggregation] = useState(null);

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

  const startElwoodJob = async (datasetId, requestArgs, jobString) => {
    const jobQueueResp = await axios.post(
      `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
    );

    if (jobQueueResp.status === 200) {
      return jobQueueResp.data?.id;
    }
  };

  const onGeoBoundarySuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp?.boundary_box) {
      const bObj = resp?.boundary_box;
      // only do this if we have the lat/lon, otherwise it is returning a failure
      if (bObj.ymin && bObj.xmin) {
        const bounds = [[bObj.ymin, bObj.xmin], [bObj.ymax, bObj.xmax]];
        setData(bounds);
      }
      if (Object.keys(resp.boundary_box).length === 0) {
        setDataError(true);
      }
      setDataLoading(false);
    }
  }, []);

  const generateGeoBoundaryArgs = useCallback((argsAnnotations) => {
    const args = { geo_columns: [] };
    argsAnnotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));
    return args;
  }, []);

  // fetch boundary for ClipMap component
  const { data: mapBounds, error: mapBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_boundary_box',
    generateArgs: generateGeoBoundaryArgs,
    cleanupRef,
    onSuccess: onGeoBoundarySuccess,
  });

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

  const generateTemporalArgs = useCallback((argsAnnotations) => ({
    datetime_column: argsAnnotations.annotations.date[0].name,
    time_format: argsAnnotations.annotations.date[0].time_format,
  }), []);

  const onTemporalResSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp.resolution_result?.uniformity !== 'PERFECT') {
      setDataError(true);
    } else {
      setData(resp.resolution_result);
    }
    setDataLoading(false);
  }, []);

  // fetch resolution for AdjustTemporalResolution component
  const { data: timeResolution, error: timeResolutionError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_temporal_resolution',
    generateArgs: generateTemporalArgs,
    cleanupRef,
    onSuccess: onTemporalResSuccess,
  });

  const onGetDatesSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp.unique_dates.length) {
      setData(resp.unique_dates);
    } else {
    // TODO: also handle single length arrays as an error/un-transformable?
      setDataError(true);
    }
    setDataLoading(false);
  }, []);

  // fetch time bounds for ClipTime component
  const { data: timeBounds, error: timeBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_unique_dates',
    generateArgs: generateTemporalArgs,
    cleanupRef,
    onSuccess: onGetDatesSuccess,
  });

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
          loading={!mapBounds && !mapBoundsError}
          failed={mapBoundsError}
        />

        <TransformationButton
          isComplete={!!savedTimeResolution}
          Icon={AspectRatioIcon}
          title="Adjust Temporal Resolution"
          onClick={() => handleDrawerOpen('scaleTime')}
          loading={!timeResolution && !timeResolutionError}
          failed={timeResolutionError}
        />

        <TransformationButton
          isComplete={!!savedTimeBounds}
          Icon={TodayIcon}
          title="Select Temporal Coverage"
          onClick={() => handleDrawerOpen('clipTime')}
          loading={!timeBounds && !timeBoundsError}
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
