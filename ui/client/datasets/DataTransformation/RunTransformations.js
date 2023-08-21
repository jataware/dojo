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
  setAllTransformationsComplete
}) => {
  const classes = useStyles();
  const { allJobsCompleted } = useOrderedElwoodJobs(jobsConfig);

  // This triggers the DataTransformation useEffect to finish wrapping up the nextStep process
  useEffect(() => {
    if (allJobsCompleted) {
      setAllTransformationsComplete(true);
    }
  }, [allJobsCompleted, setAllTransformationsComplete]);

  return (
    <Backdrop open={!allJobsCompleted} className={classes.backdrop}>
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
