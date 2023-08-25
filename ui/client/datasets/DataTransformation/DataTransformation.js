import React, {
  useCallback, useEffect, useRef, useState
} from 'react';

import axios from 'axios';

import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import TodayIcon from '@mui/icons-material/Today';
import GridOnIcon from '@mui/icons-material/GridOn';
import MapIcon from '@mui/icons-material/Map';
import GlobeIcon from '@mui/icons-material/Public';

import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import ClipMap from './ClipMap';
import ClipTime from './ClipTime';
import Drawer from '../../components/Drawer';
import { Navigation } from '..';
import AdjustTemporalResolution from './AdjustTemporalResolution';
import AdjustGeoResolution from './AdjustGeoResolution';
import TransformationButton from './TransformationButton';
import useElwoodData from './useElwoodData';
import RunTransformations from './RunTransformations';
import {
  getPrimaryLatLonColumns,
  areLatLngAnnotated,
  generateProcessGeoResArgs,
  generateProcessTempResArgs,
  generateProcessGeoCovArgs,
  generateProcessTempCovArgs,
} from './dataTransformationHelpers';

import { GadmResolver } from './GadmResolver';

import PromptDialog from '../PromptDialog';

// import random from 'lodash/random';
// import times from 'lodash/times';

// for development purposes
// const mapResolution = 1.0000000000000013;//'Non-uniform/event data';
// const mapResolutionOptions //= null;
// = {
//  deg: [
//     1.0000000000000013,
//     2.0000000000000027,
//     3.000000000000004,
//     4.000000000000005,
//     5.000000000000007,
//     6.000000000000008,
//     7.000000000000009,
//     8.00000000000001,
//     9.000000000000012,
//  ],
//  km: [
//       111.00000000000014,
//       222.00000000000028,
//       333.00000000000045,
//       444.00000000000057,
//       555.0000000000007,
//       666.0000000000009,
//       777.000000000001,
//       888.0000000000011,
//       999.0000000000013,
// ]};
// const mapBounds = [[10.5619, 42.0864], [12.595, 43.2906]];
// const timeResolution =//  null;
// {
//   uniformity: 'PERFECT',
//   unit: 'month',
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
// mapResolutionError,
// mapBoundsError,
// timeResolutionError,
// timeBoundsError
// gadmResolutionError
// ] = [false, false, false, false, false];

/**
 *
 **/
// const gadmResolution = [
//   {
//     id: 'korea123',
//     raw_value: 'Korea',
//     gadm_resolved: 'Republic of Korea',
//     alternatives: [
//       'Republic of Korea',
//       'Democratic People\'s Republic of Korea'
//     ]
//   }
// ];

// for (let moreCountries = 0; moreCountries < 8; moreCountries++) {

//   let country = 'jspan';

//   gadmResolution.push({
//     id: country + random(0,2),
//     raw_value: country.replace('e','').replace('a','i'),
//     gadm_resolved: country,
//     alternatives: times(random(1,10), () => 'Japan')
//   });
// }

const useStyles = makeStyles()(({ spacing }) => ({
  transformationRoot: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'calc(100% - 128px)',
  },
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
}));

/**
 *
 **/
const DataTransformation = ({
  datasetInfo,
  handleNext,
  handleBack,
  annotations,
  setAnnotations,
  cleanupRef,
}) => {
  const { classes } = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [disableDrawerClose, setDisableDrawerClose] = useState(false);

  const [savedDrawings, setSavedDrawings] = useState([]);

  const [savedMapResolution, setSavedMapResolution] = useState(null);
  const [savedMapAggregation, setSavedMapAggregation] = useState(null);

  const [savedGADMOverrides, setSavedGADMOverrides] = useState(null);

  const [timeResolutionOptions, setTimeResolutionOptions] = useState([]);
  const [savedTimeResolution, setSavedTimeResolution] = useState(null);
  const [savedTimeAggregation, setSavedTimeAggregation] = useState(null);

  const [savedTimeBounds, setSavedTimeBounds] = useState(null);
  const [jobsConfig, setJobsConfig] = useState();

  const transformationsRef = useRef({});

  // all for the useElwoodData failure dialog
  const [promptTitle, setPromptTitle] = useState('');
  const [promptMessage, setPromptMessage] = useState('');
  // keep track of the failed jobs separately from the message so we can show them all
  // We do actually use this, just never directly by name - see onBackendFailure
  // eslint-disable-next-line no-unused-vars
  const [failedJobs, setFailedJobs] = useState([]);

  // toggles when the RunTransformations overlay closes
  const [allTransformationsComplete, setAllTransformationsComplete] = useState(false);
  // toggles when the RunTransformation component unmounts due to errors
  const [transformationProcessingError, setTransformationProcessingError] = useState(false);

  // Handles the next step process after the transformations are complete in <RunTransformation>
  useEffect(() => {
    // There is always at least one required transformation
    // time scaling happens even if the user hasn't annotated a date column
    if (allTransformationsComplete) {
      if (jobsConfig.length) {
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
        // Ensure annotations with potential gadm resolver updates are stored
        // To pass in to next step / jobs:
        setAnnotations({
          annotations: annotations.annotations,
          metadata: clonedMetadata
        });

        handleNext();
      });
    }
  }, [
    allTransformationsComplete,
    jobsConfig,
    annotations,
    datasetInfo.id,
    handleNext,
    setAnnotations
  ]);

  const onBackendFailure = (jobString) => {
    setFailedJobs((prevJobs) => {
      // all of the following needs to happen within setFailedJobs or it won't update in
      // PromptDialog because of render cycle & closure btw useElwoodData/DataTransformation etc
      const newFailedJobs = [...prevJobs, jobString];

      setPromptTitle('Something went wrong');
      setPromptMessage(
        <div>
          An unexpected system error occurred while running job(s):
          <ul>
            {newFailedJobs.map((job, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index} style={{ color: '#99223398' }}>{job}</li>
            ))}
          </ul>
          <br />Contact Jataware for assistance.
        </div>
      );

      return newFailedJobs;
    });
  };

  const closePrompt = () => {
    setPromptTitle('');
    setPromptMessage('');
    setFailedJobs([]);
  };

  // until we get the list of timeresoptions from the backend:
  if (!timeResolutionOptions.length) {
    setTimeResolutionOptions([
      { alias: 'D', description: 'day' },
      { alias: 'W', description: 'weekly' },
      { alias: 'M', description: 'month end' },
      { alias: 'Q', description: 'quarter end' },
      { alias: 'Y', description: 'year end' },
    ]);
  }

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
      setData(resp.scale_deg);

      if (resp.multiplier_samples_deg) {
        setOptions({
          deg: resp.multiplier_samples_deg,
          km: resp.multiplier_samples_km,
        });
      }
    } else {
      if (areLatLngAnnotated(annotations)) {
        // as long as we have lat/lng annotated, set this string as our default geo resolution
        setData('Non-uniform/event data');
        return;
      }
      // TODO: handle error case in geo res component & data transformation
      let message = 'Resolution not detectable';
      // if we have a uniformity that is not handled above, change the message to:
      if (resp.resolution_result?.uniformity) message = 'Resolution not uniform';
      setDataError(message);
    }

    setDataLoading(false);
  }, [annotations]);

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
      if (
        resp.uniformity === 'PERFECT'
        || resp.resolution_result.uniformity === 'UNIFORM'
        || resp.resolution_result.uniformity === 'PERFECTLY_UNIFORM'
      ) {
        setData(resp.resolution_result);
      } else {
        // If it isn't one of the three uniform types above, default to 'day'
        // because we don't actually know the temporal resolution no matter what we get back
        setData('day');
      }
    } else {
      // display this string as the starting point for non-uniform data
      // this only happens for datasets without an annotated date column
      setData('Non-uniform/event data');
      // we may want to handle errors if there is no annotated date, tbd
      // setDataError(resp.message ? resp.message : true);
    }
    setDataLoading(false);
  }, []);

  const onGadmResSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp) {
      if (resp.fuzzy_match && resp.fuzzy_match.length) {
        setData(resp);
      } else {
        setDataError('Nothing to review.');
      }
    } else {
      setDataError('Something went wrong. Please contact Jataware for assistance.');
    }
    setDataLoading(false);
  }, []);

  const onGadmCountriesSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
    if (resp) {
      setData(resp);
    } else {
      setDataError('Something went wrong. Please contact Jataware for assistance.');
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
    generateArgs: () => generateFetchGeoResArgs(annotations),
    cleanupRef,
    onSuccess: onGeoResSuccess,
    onBackendFailure
  });

  const {
    data: gadmResolution,
    error: gadmResolutionError
  } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'gadm_processors.resolution_alternatives',
    generateArgs: () => {},
    cleanupRef,
    onSuccess: onGadmResSuccess,
    onBackendFailure
  });

  const {
    data: gadmCountries,
    error: gadmCountriesError
  } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'gadm_processors.all_gadm_values',
    generateArgs: () => {},
    cleanupRef,
    onSuccess: onGadmCountriesSuccess,
    onBackendFailure
  });

  // fetch boundary for ClipMap component
  const { data: mapBounds, error: mapBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_boundary_box',
    generateArgs: () => generateFetchGeoBoundaryArgs(annotations),
    cleanupRef,
    onSuccess: onGeoBoundarySuccess,
    onBackendFailure
  });

  // fetch resolution for AdjustTemporalResolution component
  const { data: timeResolution, error: timeResolutionError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'resolution_processors.calculate_temporal_resolution',
    generateArgs: () => generateFetchTemporalArgs(annotations),
    cleanupRef,
    onSuccess: onTemporalResSuccess,
    onBackendFailure
  });

  // fetch time bounds for ClipTime component
  const { data: timeBounds, error: timeBoundsError } = useElwoodData({
    datasetId: datasetInfo.id,
    annotations,
    jobString: 'transformation_processors.get_unique_dates',
    generateArgs: () => generateFetchTemporalArgs(annotations),
    cleanupRef,
    onSuccess: onGetDatesSuccess,
    onBackendFailure
  });

  const mapResolutionLoading = !mapResolution && !mapResolutionError;
  const mapBoundsLoading = !mapBounds && !mapBoundsError;
  const timeResolutionLoading = !timeResolution && !timeResolutionError;
  const timeBoundsLoading = !timeBounds && !timeBoundsError;
  const gadmResolutionLoading = !gadmResolution && !gadmResolutionError;
  const gadmCountriesLoading = !gadmCountries && !gadmCountriesError;

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

  const disableNext = () => {
    if (
      mapResolutionLoading
      || mapBoundsLoading
      || timeResolutionLoading
      || timeBoundsLoading
      || gadmResolutionLoading
    ) {
      // disable if any of the transformations are loading
      return true;
    }

    if (!mapResolutionError && !savedMapResolution) {
      // disable if we are requiring a map resolution to be chosen and it hasn't been
      return true;
    }

    if (!timeResolutionError && !savedTimeResolution) {
      // disable if we are requiring a time resolution to be set and it hasn't been
      return true;
    }

    if (!gadmResolutionError && !savedGADMOverrides) {
      return true;
    }

    return false;
  };

  const processClipTime = () => {
    let config;
    if (savedTimeBounds) {
      const args = generateProcessTempCovArgs({
        annotations,
        start: savedTimeBounds[0],
        end: savedTimeBounds[savedTimeBounds.length - 1],
      });

      transformationsRef.current.clip_time = args;

      config = {
        datasetId: datasetInfo.id,
        annotations,
        onSuccess: (data) => console.log('First job data - clip time:', data),
        generateArgs: () => args,
        jobString: 'transformation_processors.clip_time',
        cleanupRef,
        onBackendFailure,
      };
    }
    return config;
  };

  const processClipGeo = () => {
    let config;
    if (savedDrawings.length > 0) {
      const args = generateProcessGeoCovArgs(annotations, savedDrawings);

      transformationsRef.current.clip_geo = args;

      config = {
        datasetId: datasetInfo.id,
        annotations,
        onSuccess: (data) => console.log('Second job data - clip geo:', data),
        generateArgs: () => args,
        jobString: 'transformation_processors.clip_geo',
        cleanupRef,
        onBackendFailure,
      };
    }
    return config;
  };

  const processScaleTime = () => {
    let config;
    if (savedTimeResolution) {
      const args = generateProcessTempResArgs(
        annotations,
        savedTimeResolution,
        savedTimeAggregation
      );

      transformationsRef.current.scale_time = args;

      config = {
        datasetId: datasetInfo.id,
        annotations,
        onSuccess: (data) => console.log('Third job data - scale time:', data),
        generateArgs: () => args,
        jobString: 'transformation_processors.scale_time',
        cleanupRef,
        onBackendFailure,
      };
    }
    return config;
  };

  const processRegridGeo = () => {
    let config;
    if (savedMapResolution) {
      const args = generateProcessGeoResArgs({
        annotations,
        newMapResolution: savedMapResolution,
        oldMapResolution: mapResolution,
        aggregation: savedMapAggregation
      });

      // save the args to a ref so we can store them on the annotations object
      transformationsRef.current.regrid_geo = args;

      // If non-uniform is selected, don't run the transformation
      if (savedMapResolution !== 'Non-uniform/event data') {
        config = {
          datasetId: datasetInfo.id,
          annotations,
          onSuccess: (data) => console.log('Fourth job data - regrid geo:', data),
          generateArgs: () => args,
          jobString: 'transformation_processors.regrid_geo',
          cleanupRef,
          onBackendFailure,
        };
      }
    }

    return config;
  };

  const processGadmOverrides = () => {
    transformationsRef.current.overrides = { gadm: savedGADMOverrides };
  };

  const handleNextStep = () => {
    // clear this before running each time, in case we're re-running after errors
    setJobsConfig(null);

    const clipTime = processClipTime();
    const clipMap = processClipGeo();
    const scaleTime = processScaleTime();
    const regridGeo = processRegridGeo();

    // The jobs always happen in this specific order
    // only do the jobs that are defined
    const transformations = [clipTime, clipMap, scaleTime, regridGeo]
      .filter((job) => job !== undefined);

    processGadmOverrides();

    // in case there were errors, we want to re-mount the component and try again when
    // NEXT is clicked again
    setTransformationProcessingError(false);

    // jobsConfig triggers the useOrderedElwoodJobs hook to fire from the RunTransformation
    // child component
    setJobsConfig(transformations);
    // The actual jump to next step happens in the useEffect at the top of this function
    // after the jobs have completed in RunTransformation
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
            savedAggregation={savedMapAggregation}
            setSavedAggregation={setSavedMapAggregation}
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
            savedAggregation={savedTimeAggregation}
            setSavedAggregation={setSavedTimeAggregation}
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
      case 'gadmResolutionReview':
        return (
          <GadmResolver
            gadmRowData={gadmResolution}
            onSave={(data) => { setSavedGADMOverrides(data); handleDrawerClose(); }}
            onCancel={handleDrawerClose}
            overrides={savedGADMOverrides}
            countries={gadmCountries}
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
          isComplete={Boolean(savedGADMOverrides)}
          Icon={GlobeIcon}
          title="Review Administrative Area Detection"
          onClick={() => handleDrawerOpen('gadmResolutionReview')}
          loading={gadmResolutionLoading || gadmCountriesLoading}
          error={gadmResolutionError}
          required={!gadmResolutionError}
        />
        <TransformationButton
          isComplete={!!savedMapResolution}
          Icon={GridOnIcon}
          title="Adjust Geospatial Resolution"
          onClick={() => handleDrawerOpen('regridMap')}
          loading={mapResolutionLoading}
          error={mapResolutionError}
          required={!mapResolutionError}
        />
        <TransformationButton
          isComplete={!!savedDrawings.length}
          Icon={MapIcon}
          title="Select Geospatial Coverage"
          onClick={() => handleDrawerOpen('clipMap')}
          loading={mapBoundsLoading}
          error={mapBoundsError}
        />
        <TransformationButton
          isComplete={!!savedTimeResolution}
          Icon={AspectRatioIcon}
          title="Adjust Temporal Resolution"
          onClick={() => handleDrawerOpen('scaleTime')}
          loading={timeResolutionLoading}
          error={timeResolutionError}
          required={!timeResolutionError}
        />
        <TransformationButton
          isComplete={!!savedTimeBounds}
          Icon={TodayIcon}
          title="Select Temporal Coverage"
          onClick={() => handleDrawerOpen('clipTime')}
          loading={timeBoundsLoading}
          error={timeBoundsError}
        />
      </List>
      <Navigation
        label="Next"
        handleNext={handleNextStep}
        handleBack={handleBack}
        disableNext={disableNext()}
      />

      <Drawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anchorPosition="right"
        noConfirm
        PaperProps={{ elevation: 0 }}
        wide
        variant="temporary"
      >
        {drawerInner()}
      </Drawer>
      <PromptDialog
        title={promptTitle}
        message={promptMessage}
        open={Boolean(promptMessage)}
        handleClose={closePrompt}
      />

      {jobsConfig && !transformationProcessingError && (
        <RunTransformations
          jobsConfig={jobsConfig}
          setAllTransformationsComplete={setAllTransformationsComplete}
          setTransformationProcessingError={setTransformationProcessingError}
        />
      )}
    </div>
  );
};

/**
 * This component mounts specifically to run the restore_raw_file data transformation before any
 * of the other useElwoodData jobs run, as we need to confirm that the file is in its original
 * state before the other ones can run.
 * It also holds onto the cleanupRef that will prevent the various useElwoodData calls from
 * repeating forever if we navigate away
 **/
export default ({
  datasetInfo,
  stepTitle,
  handleNext,
  handleBack,
  setAnnotations,
  annotations,
}) => {
  const { classes } = useStyles();
  // this ref keeps track of when the page is mounted so that we can avoid useElwoodData running
  // endlessly if we navigate away while it's still going
  // it should be passed into every use of useElwoodData
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
    onBackendFailure: () => {},
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
          setAnnotations={setAnnotations}
          cleanupRef={cleanupRef}
        />
      )}
    </Container>
  );
};
