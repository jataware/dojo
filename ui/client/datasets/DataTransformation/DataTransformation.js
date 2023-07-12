import React, {
  useCallback, useEffect, useRef, useState
} from 'react';

import axios from 'axios';

import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

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
import {
  getPrimaryLatLonColumns,
  generateProcessGeoResArgs,
  generateProcessTempResArgs,
  generateProcessGeoCovArgs,
  generateProcessTempCovArgs,
} from './dataTransformationHelpers';

// for development purposes
// const mapResolution = 111.00000000000014;
// const mapResolutionOptions = [
//   222.00000000000028,
//   333.00000000000045,
//   444.00000000000057,
//   555.0000000000007,
//   666.0000000000009,
//   777.000000000001,
//   888.0000000000011,
//   999.0000000000013,
//   1110.0000000000014,
//   1221.0000000000016,
//   1332.0000000000018,
//   1443.0000000000018,
//   1554.000000000002,
//   1665.000000000002,
//   1776.0000000000023,
//   1887.0000000000025,
//   1998.0000000000025,
//   2109.0000000000027,
//   2220.0000000000027
// ];
// const mapBounds = [[10.5619, 42.0864], [12.595, 43.2906]];
// const timeResolution = {
//   uniformity: 'PERFECT',
//   unit: 'day',
//   resolution: 1,
//   error: 0
// };

// const unique_dates = [
//   '1997-09-01',
//   '1998-03-22',
//   '1998-03-23',
//   '1999-03-28',
//   '1999-04-13',
//   '1999-04-15',
//   '1999-04-27',
//   '2009-06-06',
//   '2009-06-07',
//   '2009-08-31',
//   '2013-01-17',
//   '2013-02-25',
//   '2013-02-26',
//   '2020-07-03',
//   '2020-07-05',
//   '2020-07-06',
//   '2020-07-10',
//   '2021-01-23',
//   '2021-01-31',
//   '2021-02-09',
//   '2021-02-18',
//   '2021-02-25',
//   '2021-03-03',
//   '2021-03-26'
// ];
// const timeBounds = unique_dates;

// const [
//   mapResolutionError,
//   mapBoundsError,
//   timeResolutionError,
//   // timeBoundsError
// ] = [false, false, false, false,];

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

  const transformationsRef = useRef({});

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

  const generateFetchGeoResArgs = useCallback((argsAnnotations) => {
    const geoColumns = getPrimaryLatLonColumns(argsAnnotations.annotations.geo);
    if (geoColumns) {
      return geoColumns;
    }
    return 'Geospatial resolution cannot be transformed without annotated lat/lng columns marked as primary geo';
  }, []);

  const generateFetchGeoBoundaryArgs = useCallback((argsAnnotations) => {
    const geoColumns = getPrimaryLatLonColumns(argsAnnotations.annotations.geo);

    if (geoColumns) {
      return { geo_columns: geoColumns };
    }
    return 'Geospatial coverage cannot be transformed without annotated lat/lng columns marked as primary geo';
  }, []);

  const generateFetchTemporalArgs = useCallback((argsAnnotations) => {
    if (!argsAnnotations.annotations.date[0]) {
      return 'Temporal data cannot be transformed without a primary annotated date column';
    }
    return {
      datetime_column: argsAnnotations.annotations.date[0]?.name,
      time_format: argsAnnotations.annotations.date[0]?.time_format,
    };
  }, []);

  const onGeoResSuccess = useCallback((
    resp, setData, setDataError, setDataLoading, setOptions
  ) => {
    if (resp.resolution_result?.uniformity === 'PERFECT'
      || resp.resolution_result?.uniformity === 'UNIFORM') {
      setData(resp.scale_km);
    } else {
      // TODO: handle error case in geo res component & data transformation
      let message = 'Resolution not detectable';
      // if we have a uniformity that is not handled above, change the message to:
      if (resp.resolution_result?.uniformity) message = 'Resolution not uniform';
      setDataError(message);
    }

    if (resp.multiplier_samples) {
      setOptions(resp.multiplier_samples);
    }
    setDataLoading(false);
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

  // fetch resolution for AdjustGeoResolution
  const {
    data: mapResolution,
    options: mapResolutionOptions,
    error: mapResolutionError
  } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_geographical_resolution',
    generateArgs: generateFetchGeoResArgs,
    cleanupRef,
    onSuccess: onGeoResSuccess,
  });

  // fetch boundary for ClipMap component
  const { data: mapBounds, error: mapBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_boundary_box',
    generateArgs: generateFetchGeoBoundaryArgs,
    cleanupRef,
    onSuccess: onGeoBoundarySuccess,
  });

  // fetch resolution for AdjustTemporalResolution component
  const { data: timeResolution, error: timeResolutionError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_temporal_resolution',
    generateArgs: generateFetchTemporalArgs,
    cleanupRef,
    onSuccess: onTemporalResSuccess,
  });

  // fetch time bounds for ClipTime component
  const { data: timeBounds, error: timeBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_unique_dates',
    generateArgs: generateFetchTemporalArgs,
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
      const args = generateProcessGeoResArgs(annotations, savedMapResolution, mapResolution);
      // save the args to a ref so we can store them on the annotations object
      transformationsRef.current.regrid_geo = args;
      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.regrid_geo');
    }
  };

  const processMapClippings = () => {
    if (savedDrawings.length > 0) {
      const args = generateProcessGeoCovArgs(annotations, savedDrawings);
      transformationsRef.current.clip_geo = args;
      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_geo');
    }
  };

  const processClipTime = () => {
    if (savedTimeBounds) {
      const args = generateProcessTempCovArgs({
        annotations,
        start: savedTimeBounds[0],
        end: savedTimeBounds[savedTimeBounds.length - 1],
      });
      transformationsRef.current.clip_time = args;
      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.clip_time');
    }
  };

  const processAdjustTime = () => {
    if (savedTimeResolution) {
      const args = generateProcessTempResArgs(annotations, savedTimeResolution, savedAggregation);
      transformationsRef.current.scale_time = args;
      return startElwoodJob(datasetInfo.id, args, 'transformation_processors.scale_time');
    }
  };

  const handleNextStep = () => {
    const adjustGeo = processAdjustGeo();
    const clipMap = processMapClippings();
    const adjustTime = processAdjustTime();
    const clipTime = processClipTime();
    // Only do all of the below when we've done all of the selected transformations
    // any untouched transformations won't return a promise and thus won't delay this
    Promise.all([adjustGeo, clipMap, adjustTime, clipTime]).then((responses) => {
      let modified;
      responses.forEach((resp) => {
        // if any are truthy (an untouched transformation will be undefined)
        if (resp) modified = true;
      });

      if (modified) {
        // This lets us know that we need to show the spinner when the restore_raw_file job
        // is running when revisiting this page in the registration flow
        localStorage.setItem(`dataTransformation-${datasetInfo.id}`, true);
      }

      // If there are no transformations, skip updating the annotations object
      if (isEmpty(transformationsRef.current)) {
        handleNext();
        return;
      }

      // If there are transformations, we want to store the data transformation decisions
      const clonedMetadata = cloneDeep(annotations.metadata);
      // add all the args that we sent to the elwood jobs and stored in our ref
      // to our cloned metadata object
      clonedMetadata.transformations = transformationsRef.current;
      // and PATCH that to the dataset's annotations
      // along with the existing annotations so it doesn't overwrite anything
      axios.patch(
        `/api/dojo/indicators/${datasetInfo.id}/annotations`, {
          annotations: annotations.annotations,
          metadata: clonedMetadata
        }
      ).then(() => {
        // Only handleNext once we've updated the annotations
        handleNext();
      });
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
            jobString="transformation_processors.regrid_geo"
            datasetId={datasetInfo.id}
            annotations={annotations}
            cleanupRef={cleanupRef}
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
            jobString="transformation_processors.scale_time"
            datasetId={datasetInfo.id}
            annotations={annotations}
            cleanupRef={cleanupRef}
          />
        );
      case 'clipTime':
        return (
          <ClipTime
            timeBounds={timeBounds}
            savedTimeBounds={savedTimeBounds}
            setSavedTimeBounds={setSavedTimeBounds}
            closeDrawer={handleDrawerClose}
            jobString="transformation_processors.clip_time"
            datasetId={datasetInfo.id}
            annotations={annotations}
            cleanupRef={cleanupRef}
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

  // eslint-disable-next-line no-unused-vars
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
