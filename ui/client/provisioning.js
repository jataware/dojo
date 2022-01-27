import React, { useCallback, useEffect, useState } from 'react';

import axios from 'axios';

import Backdrop from '@material-ui/core/Backdrop';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import LoadingOverlay from './components/LoadingOverlay';
import {
  useLastProvisionLogs,
} from './components/SWRHooks';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  progressWrapper: {
    height: theme.spacing(3),
    margin: [[theme.spacing(3), 0]],
  },
  paper: {
    minHeight: '360px',
    minWidth: '825px',
    padding: theme.spacing(3),
  },
  progress: {
    height: '12px',
    borderRadius: theme.shape.borderRadius,
  },
  buttonWrapper: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  detailsWrapper: {
    marginBottom: theme.spacing(2),
  },
}));

const CurrentState = ({
  provisionStatus, provisionLogs, provisionLogsLoading
}) => {
  const classes = useStyles();

  return (
    <div className={classes.detailsWrapper}>
      <Typography gutterBottom align="center" variant="h6">
        Current State: {provisionStatus}
      </Typography>
      <div>
        {!provisionLogsLoading && provisionLogs?.logs.map((item) => (
          <Typography key={item}>{item}</Typography>
        ))}
      </div>
    </div>
  );
};

// Do this here rather than through SWR because we aren't getting any data back
// so we don't need to cache anything to revalidate in the future
const useLockStatusCheck = (modelId) => {
  const [lockExists, setLockExists] = useState(false);
  const [lockLoading, setLockLoading] = useState(true);
  const [lockError, setLockError] = useState(false);

  useEffect(() => {
    axios.get(`/api/clouseau/docker/locks/${modelId}`)
      .then((response) => {
        // here we're just checking if the lock exists for this model id, not whether it has
        // fully loaded (ie returns response.data.containerId.length && !== 'unset')
        // so that we can start showing the loading status page
        if (response.status === 200) {
          setLockExists(true);
          setLockLoading(false);
        }
      }).catch((error) => {
        setLockError(true);
        setLockLoading(false);
        console.error('There was an error fetching the lock: ', error);
      });
  }, [modelId]);

  return { lockExists, lockLoading, lockError };
};

const Provisioning = () => {
  const { modelId } = useParams();
  const history = useHistory();
  const classes = useStyles();

  const [ready, setReady] = useState(false);

  const [provisionState, setProvisionState] = useState();

  const { lockExists, lockLoading, lockError } = useLockStatusCheck(modelId);

  const {
    provisionLogs, provisionLogsLoading, mutateProvisionLogs
  } = useLastProvisionLogs(modelId);

  const fetchProvisionState = useCallback(() => {
    axios.get(`/api/clouseau/provision/state/${modelId}`)
      .then((response) => {
        setProvisionState(response.data);
      });
  }, [modelId]);

  useEffect(() => {
    // fetch provision state when the page first loads
    fetchProvisionState();
  }, [fetchProvisionState]);

  useEffect(() => {
    if (provisionState?.state === 'ready') {
      setReady(true);
    }
  }, [provisionState?.state]);

  useEffect(() => {
    // we want to force these to update very frequently, as they tell us when
    // the provision logs have changed and when our provisioned model is ready
    const mutateInterval = setInterval(() => {
      mutateProvisionLogs();
      fetchProvisionState();
    }, 1000);

    return () => clearInterval(mutateInterval);
  }, [mutateProvisionLogs, fetchProvisionState]);

  useEffect(() => {
    if (ready) {
      history.push(`/term/${modelId}`);
    }
  }, [ready, history, modelId]);

  if (lockLoading) {
    return (
      <LoadingOverlay text={`Provisioning workers for model ${modelId}`} />
    );
  }

  if (lockError || !lockExists) {
    return (
      <LoadingOverlay
        text="There was an error setting up your container. Please try again."
        link={{ text: 'Return to the set up page', href: `/provision/${modelId}` }}
        error
      />
    );
  }

  return (
    <Backdrop open className={classes.backdrop}>
      <Paper className={classes.paper}>
        <div className={classes.progressWrapper}>
          <LinearProgress
            color="primary"
            variant={provisionState?.state === 'ready' ? 'determinate' : 'indeterminate'}
            value={provisionState?.state === 'ready' ? 100 : 0}
            classes={{ root: classes.progress }}
          />
        </div>
        <CurrentState
          modelId={modelId}
          provisionStatus={provisionState?.state}
          provisionLogs={provisionLogs}
          provisionLogsLoading={provisionLogsLoading}
        />
      </Paper>
    </Backdrop>
  );
};

export default Provisioning;
