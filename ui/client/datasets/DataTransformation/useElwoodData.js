import { useState, useEffect } from 'react';
import axios from 'axios';

// Hook that handles all the data fetching from Elwood
const useElwoodData = ({
  datasetId,
  annotations,
  onSuccess,
  generateArgs,
  jobString,
  cleanupRef,
  onBackendFailure,
}) => {
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  // This is necessary for useOrderedElwoodJobs to run multiple jobs in sequence
  // with the same hook but changing jobString
  useEffect(() => {
    // Reset the state when jobString changes
    setData(null);
    setDataError(false);
    setDataLoading(false);
  }, [jobString]);

  useEffect(() => {
    const handleFailure = () => {
      setDataError('An unexpected error occurred while starting the job.');
      onBackendFailure(jobString);
      setDataLoading(false);
    };

    // Kicks off the elwood job
    const startElwoodJob = async ({ requestArgs }) => {
      const jobQueueResp = await axios.post(
        `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
      );

      if (jobQueueResp.status === 200) {
        return jobQueueResp.data;
      }
    };

    // repeatedly calls /job/fetch/jobId until it gets the job results
    const repeatFetch = (jobId, requestArgs, onFailure) => {
      setTimeout(() => {
        axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
          if (response.status === 200) {
            if (response.data) {
              // setOptions currently just used for onGeoResSuccess
              onSuccess(response.data, setData, setDataError, setDataLoading, setOptions);
              return;
            }

            if (cleanupRef.current) {
              // if no data and the component is mounted, try the fetch again
              repeatFetch(jobId, requestArgs, onFailure);
            }
          }
        }).catch(() => {
          if (cleanupRef.current) {
            // If our initial fetch failed, then we haven't started a job yet
            // only do this if the parent component (cleanupRef) is still mounted
            startElwoodJob({ requestArgs }).then((resp) => {
              repeatFetch(resp, requestArgs, onFailure);
            });
          } else {
            // we only get here if the component is unmounted, otherwise we keep trying to restart
            // this may be something to reconsider
            onFailure();
          }
        });
      }, 500);
    };

    // the jobId is always this format so we can create it here
    const jobId = `${datasetId}_${jobString}`;
    // check if the job is already running or finished when we first hit the page
    const checkExistingJob = async () => {
      try {
        const response = await axios.post(`/api/dojo/job/fetch/${jobId}`);
        if (response.status === 200 && response.data === null) {
          return { state: 'running' };
        }

        if (response.status === 200) {
          return { state: 'finished', data: response.data };
        }

        return { state: 'not_started' };
      } catch (error) {
        // if we get a 404, then we haven't started the job yet
        return { state: 'not_started' };
      }
    };

    // the initial kickoff flow if we haven't started the job
    const runElwoodJob = ({ requestArgs, onFailure }) => {
      if (datasetId) {
        startElwoodJob({ requestArgs })
          .then((jobData) => {
            if (jobData.result) {
              onSuccess(jobData.result, setData,
                setDataError, setDataLoading, setOptions);
            } else if (jobData.job_error) {
              handleFailure();
            } else {
              repeatFetch(jobData.id, requestArgs, onFailure);
            }
          })
          .catch(() => handleFailure());
      }
    };

    // The function that runs when we hit the page
    const startJob = async (args, onFailure) => {
      const jobCheckResult = await checkExistingJob();
      switch (jobCheckResult.state) {
        case 'running':
          // if running, repeatedly fetch until we get the results
          repeatFetch(jobId, args, onFailure);
          break;
        case 'finished':
          // if finished, return the results to the requesting component
          onSuccess(jobCheckResult.data, setData, setDataError, setDataLoading, setOptions);
          break;
        case 'not_started':
        default:
          // if not started, kick off the job
          runElwoodJob({
            requestArgs: args,
            onFailure,
          });
          break;
      }
    };

    if (!data && !dataError && !dataLoading && annotations?.annotations !== null) {
      // ensure that nothing is empty or falsy before we start
      // annotations.annotations is populated with an empty object before it is fully populated
      if (Object.keys(annotations?.annotations).length) {
        setDataLoading(true);
        const args = generateArgs(annotations);
        const onFailure = () => {
          setDataError(true);
          setDataLoading(false);
        };
        if (typeof args === 'string') {
          // if we are missing something from the args and have sent back an error message
          // use that and don't continue loading
          setDataError(args);
          setDataLoading(false);
        } else {
          startJob(args, onFailure);
        }
      }
    }
  }, [
    cleanupRef,
    datasetId,
    annotations,
    jobString,
    data,
    dataError,
    dataLoading,
    generateArgs,
    onSuccess,
    onBackendFailure
  ]);

  return { data, options, error: dataError };
};

export default useElwoodData;
