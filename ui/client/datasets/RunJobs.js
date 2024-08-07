import React, { useContext, useEffect, useState } from 'react';

import { CircularProgress } from '@mui/material';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FailedIcon from '@mui/icons-material/Clear';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import axios from 'axios';

import { Navigation } from '.';
import { FlowContext } from './FlowContext';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    padding: `0 ${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(4)}`,
    flexDirection: 'column',
    flex: 1,
    height: '100%'
  },
  header: {
  },
  loadingWrapper: {
    display: 'flex',
    flex: '1 1 10rem',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  failedIcon: {
    fontSize: '9rem',
    opacity: 0.5
  },
  failedChipMessage: {
    borderBottom: '1px solid gray',
    marginBottom: '0.75rem'
  },
  preformattedOutput: {
    width: '75%',
    padding: '1.25rem',
    background: '#DDDDDD44',
    overflow: 'auto',
    maxHeight: '30%'
  }
}));

const RunJobs = ({
  datasetInfo, setDatasetInfo, stepTitle, annotations, setAnnotations,
  handleNext, handleBack, jobs, rawFileName, ...props
}) => {
  const { classes } = useStyles();

  const [jobData, setJobData] = useState(null);
  const [jobIndex, setJobIndex] = useState(0);

  useEffect(() => {
    const updateJobData = ({ firstRun } = {}) => {
      const job = jobs[jobIndex];
      // const job_id = job.id;
      const url = `/api/dojo/job/${datasetInfo.id}/${job.id}`;
      let context;
      if (job.send_context) {
        context = {
          uuid: datasetInfo.id,
          dataset: datasetInfo,
          annotations,
        };
      }
      const payload = {
        context,
        ...job.args,
        filename: rawFileName,
        force_restart: firstRun,
      };
      axios({
        method: 'post',
        url,
        data: payload,
      }).then((response) => {
        setJobData(response.data);
      }); // TODO catch , finally
    };

    let timeoutHandle;

    if (!(datasetInfo?.id)) {
      return;
    }

    if (jobData === null) {
      // Run right away on page load
      updateJobData({ firstRun: true });
    } else if (jobData.status === 'finished') {
      const newJobIndex = jobIndex + 1;
      const job = jobs[jobIndex];
      if (job.handler) {
        job.handler({
          result: jobData.result,
          job,
          rawFileName,
          datasetInfo,
          setDatasetInfo,
          annotations,
          setAnnotations,
          ...props
        });
      }
      if (newJobIndex < jobs.length) {
        setJobIndex(newJobIndex);
        setJobData(null);
      } else {
        handleNext({});
      }
    } else if (jobData.status === 'failed') {
      console.log('failed');
    } else {
      // No result, wait for an update
      timeoutHandle = setTimeout(updateJobData, 1500);
    }

    // Clean up timeout each time we're done
    // Crucially important on the last time we run into between unmounting
    //  (eg navigating out of RunJob page by pressing back button)
    //  in order to remove the setTimeout and updateJobData fn invocation.
    return () => {
      clearTimeout(timeoutHandle);
    };
  }, [
    jobData,
    datasetInfo.id,
    annotations,
    datasetInfo,
    handleNext,
    jobIndex,
    jobs,
    props,
    rawFileName,
    setAnnotations,
    setDatasetInfo,
  ]);

  // clear rqworker jobs and go back to previous step
  // currently only applies to the 'BasicRegistrationFlow' but shouldn't harm others
  const clearBack = async () => {
    try {
      // clear the rqworker jobs for this dataset id
      // so that the transformations page will not use cached results for stale data
      await axios.post(`/api/dojo/job/clear/${datasetInfo.id}`);
    } catch (error) {
      console.info(error?.response?.data);
    }

    handleBack();
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="lg"
    >
      <div className={classes.loadingWrapper}>
        <Typography
          className={classes.header}
          variant="h4"
          align="center"
        >
          {stepTitle}
        </Typography>
          &nbsp;

        {jobData?.status !== 'failed' ? (
          <CircularProgress />
        ) : (
          <>
            <FailedIcon
              color="secondary"
              className={classes.failedIcon}
            />

            <Chip
              className={classes.failedChipMessage}
              label="FAILED"
            />

            <pre className={classes.preformattedOutput}>
              {jobData.errorDisplay || jobData.job_error}
            </pre>
          </>
        )}

      </div>

      {/* TODO NOTE Temporary for navigation testing. Should auto-go to next when complete. */}
      <Navigation
        handleNext={null}
        handleBack={clearBack}
      />
    </Container>
  );
};
RunJobs.SKIP = true; // TODO probably set within flow descriptor object in Flows.js

// Wrapper component to handle cancelling RunJobs if there are no jobs
const RunJobsWrapper = ({
  datasetInfo, setDatasetInfo, stepTitle, annotations, setAnnotations,
  handleNext, handleBack, jobs, rawFileName, ...props
}) => {
  const { direction } = useContext(FlowContext);
  const { classes } = useStyles();

  useEffect(() => {
    if (direction && direction === 'back') {
      // if the FlowContext tells us we're navigating back, then skip RunJobs altogether
      handleBack();
    }
  }, [direction, handleBack]);

  if (jobs === null || !jobs?.length) {
    return (
      <Container
        className={classes.root}
        component="main"
        maxWidth="lg"
      >
        <Typography variant="h6" align="center" sx={{ margin: 12 }}>
          There was an unexpected error. Please go back to the previous step and try again.
        </Typography>
        <Navigation
          disableNext
          handleBack={handleBack}
        />
      </Container>
    );
  }

  return (
    <RunJobs
      datasetInfo={datasetInfo}
      setDatasetInfo={setDatasetInfo}
      stepTitle={stepTitle}
      annotations={annotations}
      setAnnotations={setAnnotations}
      handleNext={handleNext}
      handleBack={handleBack}
      jobs={jobs}
      rawFileName={rawFileName}
      {...props}
    />
  );
};

export default RunJobsWrapper;
