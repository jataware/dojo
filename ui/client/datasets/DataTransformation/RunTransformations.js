import React, { useEffect } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import useOrderedElwoodJobs from './useOrderedElwoodJobs';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1000,
    color: theme.palette.grey[700],
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(20),
  },
  progress: {
    color: theme.palette.grey[300],
    marginRight: theme.spacing(4),
  },
  text: {
    color: theme.palette.grey[300],
  },
  innerWrapper: {
    display: 'flex',
    alignItems: 'center',
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
  const classes = useStyles();
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
