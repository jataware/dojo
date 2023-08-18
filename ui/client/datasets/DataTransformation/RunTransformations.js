import React, { useCallback, useEffect, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import useOrderedElwoodJobs from './useOrderedElwoodJobs';
import {
  getPrimaryLatLonColumns,
  generateProcessGeoResArgs,
  generateProcessTempResArgs,
  generateProcessGeoCovArgs,
  generateProcessTempCovArgs,
} from './dataTransformationHelpers';

// const AdjustGeo = ({
//   datasetId,
//   annotations,
//   cleanupRef,
//   transformationsRef,
//   onBackendFailure,
//   savedMapResolution,
//   mapResolution,
//   savedMapAggregation
// }) => {
//   const onTransformationSuccess = useCallback((resp, setData, setDataError, setDataLoading) => {
//     console.log('THIS IS THE RESPONSE FROM onTransformation SUCCESS', resp)
//     // if (resp.unique_dates.length) {
//     //   setData(resp.unique_dates);
//     // } else {
//     // // TODO: also handle single length arrays as an error/un-transformable?
//     //   setDataError(resp.message ? resp.message : true);
//     // }
//     // setDataLoading(false);
//   }, []);

//   const { data: adjustedGeo, error: adjustedGeoError } = useElwoodData({
//     datasetId,
//     annotations,
//     jobString: 'transformation_processors.regrid_geo',
//     generateArgs: () => generateProcessGeoResArgs({
//       annotations, savedMapResolution, mapResolution, savedMapAggregation
//     }),
//     cleanupRef,
//     onSuccess: onTransformationSuccess,
//     onBackendFailure
//   });

//   const processAdjustGeo = () => {
//     if (savedMapResolution) {
//       const args = generateProcessGeoResArgs(
//         annotations,
//         savedMapResolution,
//         mapResolution,
//         savedMapAggregation
//       );
//       // save the args to a ref so we can store them on the annotations object
//       transformationsRef.current.regrid_geo = args;

//       // If non-uniform is selected, don't run the transformation
//       if (savedMapResolution === 'Non-uniform/event data') return;

//     }
//   };


// }

// adjustTemporal
// clipTemporal
// clipGeo

const RunTransformations = ({
  jobsConfig
}) => {
  // const [transformationsRunning, setTransformationsRunning] = useState(false);

  const { data, options, error, allJobsCompleted } = useOrderedElwoodJobs(jobsConfig);

  return (
    <div>
      {!allJobsCompleted && (
        <>
          <CircularProgress />
          <h1>Processing Jobs...</h1>
        </>
      )}
    </div>
  );
};

export default RunTransformations;
