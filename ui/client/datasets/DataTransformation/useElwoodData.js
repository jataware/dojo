import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Hook that handles all the data fetching from Elwood
const useElwoodData = ({
  datasetId,
  annotations,
  onSuccess,
  generateArgs,
  jobString,
  cleanupRef,
  onBackendFailure
}) => {
  const [data, setData] = useState(null);
  const [options, setOptions] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    const startElwoodJob = async ({ requestArgs }) => {
      // console.log('these are the requestArgs when starting ', jobString, requestArgs);
      const jobQueueResp = await axios.post(
        `/api/dojo/job/${datasetId}/${jobString}`, requestArgs
      );

      if (jobQueueResp.status === 200) {
        return jobQueueResp.data;
      }
    };

    const runElwoodJob = ({ requestArgs, onFailure }) => {
      let count = 0;

      const repeatFetch = (jobId) => {
        setTimeout(() => {
          axios.post(`/api/dojo/job/fetch/${jobId}`).then((response) => {
            if (response.status === 200) {
              // keep track of how long it takes (for dev purposes)
              count += 1;
              // console.log(`${count}: response from job string: ${jobString}:`, response);
              if (response.data) {
                console.log(`success! ${jobString} took ${count * 500}ms`, response.data);
                // setOptions currently just used for onGeoResSuccess
                onSuccess(response.data, setData, setDataError, setDataLoading, setOptions);
                return;
              }
              if (cleanupRef.current) {
                // if no data and the component is mounted, try the fetch again
                repeatFetch(jobId);
              }
            }
          }).catch((err) => {
            // we get a 404 immediately - there is some sort of bug, this accounts for that
            if (count < 2 && cleanupRef.current) {
              // and the component is mounted
              // console.log('repeating job call');
              startElwoodJob({ requestArgs }).then((resp) => {
                repeatFetch(resp.id);
              });
            } else {
              console.log(`failure! ${jobString} took ${count * 500}ms`, err);
              onFailure();
            }
          });
        }, 500);
      };

      if (datasetId) {
        startElwoodJob({ requestArgs })
          .then((jobData) => {
            if (jobData.result) {
              onSuccess(jobData.result, setData,
                setDataError, setDataLoading, setOptions);
            } else if (jobData.job_error) {
              setDataError('An unexpected error occured while starting the job.');
              const displayable_jobName = /_(.+)/.exec(jobData.id)[1];
              onBackendFailure(
                <div>
                  An unexpected system error occured while running job&nbsp;
                  <span style={{ color: '#99223398' }}>{displayable_jobName}</span>.
                  <br />Contact Jataware for assistance.
                </div>
              );
              console.error(jobData.job_error);
              setDataLoading(false);
            } else {
              repeatFetch(jobData.id);
            }
          });
      }
    };

    if (!data && !dataError && !dataLoading && annotations?.annotations !== null) {
      // annotations.annotations is populated with empty objects before it is fully populated
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
          runElwoodJob({
            requestArgs: args,
            onFailure,
          });
        }
      }
    }
  }, [
    datasetId,
    annotations,
    jobString,
    data,
    dataError,
    dataLoading,
    generateArgs,
    onSuccess,
    cleanupRef
    onBackendFailure
  ]);

  return { data, options, error: dataError };
};

export default useElwoodData;
