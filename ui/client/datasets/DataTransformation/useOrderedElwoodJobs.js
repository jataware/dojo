import { useState } from 'react';

import useElwoodData from './useElwoodData';

// Higher Order Hook to manage sequential jobs
const useOrderedElwoodJob = (jobsConfig) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [allJobsCompleted, setAllJobsCompleted] = useState(false);

  // Callback to run when a job completes
  const onSuccessWrapper = (data, setData, setDataError, setDataLoading, setOptions) => {
    jobsConfig[currentJobIndex].onSuccess(data, setData, setDataError, setDataLoading, setOptions);

    // Check if there are more jobs to run
    if (currentJobIndex < jobsConfig.length - 1) {
      setCurrentJobIndex((prev) => prev + 1);
    } else {
      setAllJobsCompleted(true);
    }
  };

  const job = jobsConfig[currentJobIndex];

  const { error, ...restOfJobData } = useElwoodData({
    ...job,
    onSuccess: onSuccessWrapper
  });

  return { ...restOfJobData, allJobsCompleted, error };
};

export default useOrderedElwoodJob;
