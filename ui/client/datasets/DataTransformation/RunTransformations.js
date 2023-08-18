import React, { useCallback, useEffect, useState } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import useOrderedElwoodJobs from './useOrderedElwoodJobs';

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
