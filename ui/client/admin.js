import React, {
  useEffect, useState
} from 'react';

import axios from 'axios';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { lighten, makeStyles, useTheme } from '@material-ui/core/styles';

import { useHistory } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';
import LoadingOverlay from './components/LoadingOverlay';
import { useLocks, useNodes } from './components/SWRHooks';

const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    paddingTop: theme.spacing(1),
  },
  paper: {
    textAlign: 'left',
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
  textWrapper: {
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
  },
}));

const Admin = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [nodeInfo, setNodeInfo] = useState([]);
  const [shutDownFailed, setShutDownFailed] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const {
    locks, locksLoading, locksError, mutateLocks
  } = useLocks();
  const {
    nodes, nodesLoading, nodesError, mutateNodes
  } = useNodes();

  useEffect(() => {
    document.title = 'Admin - Dojo';
  }, []);

  useEffect(() => {
    const refreshNodeInfo = async () => {
      // go through all the locks and fetch their states
      const lockStates = await Promise.all(locks.map(async (lock) => {
        const response = await fetch(`/api/clouseau/provision/state/${lock.modelId}`);
        if (response.ok) {
          return { ...lock, status: (await response.json()) };
        }
        return lock;
      }));

      // go through nodes and match up locks with nodes
      const nodeInformation = nodes.map((node) => {
        const lock = lockStates.find((l) => l.host === node.host);
        return { ...node, lock };
      });

      setNodeInfo(nodeInformation);
      console.debug('Locks:', locks);
      console.debug('NodeInformation:', nodeInformation);
    };

    // only do this once we've loaded at least our empty arrays
    if (locks !== undefined && nodes !== undefined) {
      refreshNodeInfo(locks, setNodeInfo);
    }
  }, [locks, nodes]);

  const destroyLock = (modelId) => {
    axios.delete(`/api/clouseau/docker/${modelId}/release`).then(() => {
      mutateLocks();
      mutateNodes();
    }).catch((error) => {
      setAlertMessage(`There was an error shutting down the container: ${error}`);
      setShutDownFailed(true);
    });
  };

  if (locksLoading || nodesLoading) {
    return (
      <LoadingOverlay
        text="Loading the admin page"
      />
    );
  }

  if (locksError || nodesError) {
    return (
      <LoadingOverlay
        text="There was an error loading the admin page"
        error={locksError || nodesError}
      />
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={1} justify="center">
            {nodeInfo.map((node) => (
              <Grid item key={node.info.ID} xs={3}>
                <Paper
                  className={classes.paper}
                  style={{
                    backgroundColor: (node.status === 'up')
                      ? lighten(theme.palette.success.light, 0.4)
                      : lighten(theme.palette.warning.light, 0.4)
                  }}
                >
                  <div>
                    Worker - {node.host}
                  </div>
                  <div>
                    Status: {node.status}
                  </div>
                  <div>
                    Connections: {node.clients}
                  </div>
                  <div>
                    Containers: {node.info?.Containers}
                  </div>
                  <div>
                    Running Containers: {node.info?.ContainersRunning}
                  </div>
                  <div>
                    In use by {node.lock?.modelId}
                  </div>
                  <div>
                    Provision State: {node.lock?.status?.state}
                  </div>
                  <div>
                    {node.lock?.status?.state === 'failed' ? (
                      <details>
                        <summary>reason</summary>
                        <p>{node.lock?.status?.message}</p>
                      </details>
                    ) : ''}
                  </div>
                  <div className={classes.buttonWrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={node.lock?.status?.state !== 'ready'}
                      disableElevation
                      fullWidth
                      onClick={() => { history.push(`/term/${node.lock?.modelId}`); }}
                    >
                      Reconnect
                    </Button>
                  </div>
                  <div className={classes.buttonWrapper}>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={node.lock?.status?.state !== 'ready'}
                      disableElevation
                      fullWidth
                      onClick={() => destroyLock(node.lock?.modelId)}
                    >
                      Shut Down
                    </Button>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <BasicAlert
        alert={{ message: alertMessage, severity: 'error' }}
        visible={shutDownFailed}
        setVisible={setShutDownFailed}
      />
    </>
  );
};

export default Admin;
