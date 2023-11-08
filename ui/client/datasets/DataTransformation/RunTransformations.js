import React, { useEffect } from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import useOrderedElwoodJobs from './useOrderedElwoodJobs';

const useStyles = makeStyles()((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1000,
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(20),
  },
  progress: {
    color: theme.palette.grey[100],
  },
  text: {
    color: theme.palette.grey[100],
  },
  innerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
}));

/**
 * Runs all the transformations for DataTransformation in a standalone component so that they can
 * be fired with a specific hook call and with a loading screen.
 * This hook calls (up to) four transformations in a specific order, defined by handleNextStep
 * in DataTransformation and passed down in jobsConfig.
 **/
const RunTransformations = ({
  jobsConfig,
  setAllTransformationsComplete,
  setTransformationProcessingError,
}) => {
  const { classes } = useStyles();
  const { error, allJobsCompleted } = useOrderedElwoodJobs(jobsConfig);

  useEffect(() => {
    if (error) {
      // set this on DataTransformation to trigger it to unmount this component
      // so that we stop processing the transformations and are put back on the main screen
      // and can run the transformations again after re-mount if adjustments are made
      setTransformationProcessingError(true);
    }
  }, [error, setTransformationProcessingError]);

  // This triggers the DataTransformation useEffect to finish wrapping up the nextStep process
  useEffect(() => {
    if (allJobsCompleted) {
      setAllTransformationsComplete(true);
    }
  }, [allJobsCompleted, setAllTransformationsComplete]);

  return (
    <Backdrop open={!allJobsCompleted && !error} className={classes.backdrop}>
      <div className={classes.innerWrapper}>
        <CircularProgress size={38} className={classes.progress} />
        <Typography variant="h4" className={classes.text}>
          Processing Transformations...
        </Typography>
      </div>
    </Backdrop>
  );
};

export default RunTransformations;
