import React, {
  useCallback, useEffect, useRef, useState
} from 'react';

import axios from 'axios';

import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import TodayIcon from '@material-ui/icons/Today';
import GridOnIcon from '@material-ui/icons/GridOn';
import MapIcon from '@material-ui/icons/Map';

import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import ClipMap from './ClipMap';
import ClipTime from './ClipTime';
import Drawer from '../../components/Drawer';
import { Navigation } from '..';
import AdjustTemporalResolution from './AdjustTemporalResolution';
import AdjustGeoResolution from './AdjustGeoResolution';
import TransformationButton from './TransformationButton';
import useElwoodData from './useElwoodData';

const DataTransformation = withStyles(() => ({
  transformationRoot: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'calc(100% - 128px)',
  },
}))(({
  classes,
  datasetInfo,
  handleNext,
  handleBack,
  annotations,
  cleanupRef,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [disableDrawerClose, setDisableDrawerClose] = useState(false);

  const [savedDrawings, setSavedDrawings] = useState([]);

  const [savedMapResolution, setSavedMapResolution] = useState(null);

  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [savedTimeResolution, setSavedTimeResolution] = useState(null);
  const [savedAggregation, setSavedAggregation] = useState(null);

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

  const startElwoodJob = async (datasetId, requestArgs, jobString) => {
    const jobQueueResp = await axios.post(
      `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
    );

    if (jobQueueResp.status === 200) {
      return jobQueueResp.data?.id;
    }
  };

  const onGeoResSuccess = useCallback((
    resp, setData, setDataError, setDataLoading, setOptions
  ) => {
    if (resp.resolution_result?.uniformity === 'PERFECT') {
      setData(resp.scale_km);
    } else {
      // TODO: handle error case in geo res component & data transformation
      setDataError(resp.message ? resp.message : true);
    }

    if (resp.multiplier_samples) {
      setOptions(resp.multiplier_samples);
    }
    setDataLoading(false);
  }, []);

  const generateGeoResArgs = useCallback((argsAnnotations) => {
    const args = {};
    argsAnnotations.annotations.geo.forEach((geo) => {
      if (geo.geo_type === 'latitude') {
        args.lat_column = geo.name;
      } else {
        args.lon_column = geo.name;
      }
    });
    if (args.lat_column && args.lon_column) {
      return args;
    }
    return 'Geospatial resolution cannot be transformed without annotated lat/lon columns';
  }, []);

  const generateGeoBoundaryArgs = useCallback((argsAnnotations) => {
    const args = { geo_columns: [] };
    argsAnnotations.annotations.geo.forEach((geo) => args.geo_columns.push(geo.name));
    if (args.geo_columns.length < 2) {
      return 'Geospatial coverage cannot be transformed without annotated lat/lon columns';
    }
    return args;
  }, []);

  const generateTemporalArgs = useCallback((argsAnnotations) => {
    if (!argsAnnotations.annotations.date[0]) {
      return 'Temporal data cannot be transformed without a primary annotated date column';
    }
    return {
      datetime_column: argsAnnotations.annotations.date[0]?.name,
      time_format: argsAnnotations.annotations.date[0]?.time_format,
    };
  }, []);

  const onGeoBoundarySuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp?.boundary_box) {
      const bObj = resp?.boundary_box;
      // only do this if we have the lat/lon, otherwise it is returning a failure
      if (bObj.ymin && bObj.xmin) {
        const bounds = [[bObj.ymin, bObj.xmin], [bObj.ymax, bObj.xmax]];
        setData(bounds);
      }
      if (Object.keys(resp.boundary_box).length === 0) {
        setDataError(resp.message ? resp.message : true);
      }
      setDataLoading(false);
    }
  }, []);

  const onTemporalResSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp.resolution_result?.unit) {
      setData(resp.resolution_result);
    } else {
      setDataError(resp.message ? resp.message : true);
    }
    setDataLoading(false);
  }, []);

  const onGetDatesSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp.unique_dates.length) {
      setData(resp.unique_dates);
    } else {
    // TODO: also handle single length arrays as an error/un-transformable?
      setDataError(resp.message ? resp.message : true);
    }
    setDataLoading(false);
  }, []);

  // for testing purposes
  // const timeResolution = {
  //   "uniformity": "PERFECT",
  //   "unit": "day",
  //   "resolution": 1,
  //   "error": 0
  // };
  // (if disabling loading of all transformations)
  // const [
  //   mapResolution,
  //   mapResolutionError,
  //   mapResolutionOptions,
  //   mapBounds,
  //   mapBoundsError,
  //   timeResolution,
  //   timeResolutionError,
  //   timeBounds,
  //   timeBoundsError
  // ] = [false, false, false, false, false, false, false, false, false];

  // fetch resolution for AdjustGeoResolution
  const {
    data: mapResolution,
    options: mapResolutionOptions,
    error: mapResolutionError
  } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_geographical_resolution',
    generateArgs: generateGeoResArgs,
    cleanupRef,
    onSuccess: onGeoResSuccess,
  });

  // fetch boundary for ClipMap component
  const { data: mapBounds, error: mapBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_boundary_box',
    generateArgs: generateGeoBoundaryArgs,
    cleanupRef,
    onSuccess: onGeoBoundarySuccess,
  });

  // fetch resolution for AdjustTemporalResolution component
  const { data: timeResolution, error: timeResolutionError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_temporal_resolution',
    generateArgs: generateTemporalArgs,
    cleanupRef,
    onSuccess: onTemporalResSuccess,
  });

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
    const adjustGeo = processAdjustGeo();
    const clipMap = processMapClippings();
    const adjustTime = processAdjustTime();
    const clipTime = processClipTime();
    Promise.all([adjustGeo, clipMap, adjustTime, clipTime]).then((responses) => {
      let modified;
      responses.forEach((resp) => {
        // if any are truthy (an untouched transformation will be undefined)
        if (resp) modified = true;
      });
      if (modified) {
        localStorage.setItem(`dataTransformation-${datasetInfo.id}`, true);
      }
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
            jobString="transformation_processors.clip_geo"
            // TODO: maybe replace with elwoodArgs?
            datasetId={datasetInfo.id}
            annotations={annotations}
            cleanupRef={cleanupRef}
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
            datasetId={datasetInfo.id}
            jobString={'transformation_processors.clip_time'}

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
    <div className={classes.transformationRoot}>
      <List>
        <TransformationButton
          isComplete={!!savedMapResolution}
          Icon={GridOnIcon}
          title="Adjust Geospatial Resolution"
          onClick={() => handleDrawerOpen('regridMap')}
          loading={!mapResolution && !mapResolutionError}
          error={mapResolutionError}
        />
        <TransformationButton
          isComplete={!!savedDrawings.length}
          Icon={MapIcon}
          title="Select Geospatial Coverage"
          onClick={() => handleDrawerOpen('clipMap')}
          loading={!mapBounds && !mapBoundsError}
          error={mapBoundsError}
        />
        <TransformationButton
          isComplete={!!savedTimeResolution}
          Icon={AspectRatioIcon}
          title="Adjust Temporal Resolution"
          onClick={() => handleDrawerOpen('scaleTime')}
          loading={!timeResolution && !timeResolutionError}
          error={timeResolutionError}
        />
        <TransformationButton
          isComplete={!!savedTimeBounds}
          Icon={TodayIcon}
          title="Select Temporal Coverage"
          onClick={() => handleDrawerOpen('clipTime')}
          loading={!timeBounds && !timeBoundsError}
          error={timeBoundsError}
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
    </div>
  );
});

export default withStyles(({ spacing }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],

    height: '100%',

  },
  header: {
    marginBottom: spacing(6),
  },
  restoreFileWrapper: {
    margin: spacing(8),
  },
  restoreFileSpinner: {
    margin: [[0, 'auto', spacing(3)]],
    display: 'block',
  },
}))(({
  classes,
  datasetInfo,
  stepTitle,
  handleNext,
  handleBack,
  annotations,
}) => {
  const cleanupRef = useRef(null);
  const [showSpinner, setShowSpinner] = useState(true);

  const onSuccess = useCallback(() => {
    // once we confirm that we've restored the file, clear the localstorage and hide the spinner
    localStorage.removeItem(`dataTransformation-${datasetInfo.id}`);
    setShowSpinner(false);
  }, [datasetInfo.id]);

  const { data: fileRestored, error: fileRestoredError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.restore_raw_file',
    generateArgs: () => ({}),
    cleanupRef,
    onSuccess,
  });

  useEffect(() => {
    const modified = localStorage.getItem(`dataTransformation-${datasetInfo.id}`);
    if (!modified) {
      // if we haven't previously modified any of the data transformations, don't wait here
      setShowSpinner(false);
    }
  }, [datasetInfo.id]);

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="sm"
      ref={cleanupRef}
    >
      <div className={classes.header}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
        >
          {stepTitle}
        </Typography>
        <Typography
          variant="subtitle2"
          align="center"
          color="textSecondary"
        >
          Note: large datasets may take a long time to load
        </Typography>
      </div>
      {showSpinner ? (
        <div className={classes.restoreFileWrapper}>
          <CircularProgress className={classes.restoreFileSpinner} />
          <Typography variant="h6" align="center">
            Undoing data transformations...
          </Typography>
        </div>
      ) : (
        <DataTransformation
          datasetInfo={datasetInfo}
          handleNext={handleNext}
          handleBack={handleBack}
          annotations={annotations}
          cleanupRef={cleanupRef}
        />
      )}
    </Container>
  );
});
