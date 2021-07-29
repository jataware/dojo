import React, { useEffect, useState } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

// import { v4 as uuidv4 } from 'uuid';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import {
  ContainerInfoContextProvider,
  HistoryContextProvider,
  WebSocketContextProvider,
  useContainerInfoContext,
  useHistoryContext,
  useHistoryUpdateContext,
  useWebSocketUpdateContext,
} from './context';

// import { sleep } from './utils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    fontFamily: 'monospace',
    alignItems: 'normal',
    overflow: 'scroll',
  },
}));

const Page = ({ workerNode }) => {
  const containerInfo = useContainerInfoContext();
  const classes = useStyles();
  const history = useHistory();
  const [open] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [container, setContainer] = useState(() => ({}));
  const [enableFinished, setEnableFinished] = useState(false);
  const [publishInfo, setPublishInfo] = useState(() => ({
    publish: { status: '', message: '' },
    url: '',
    tag: '',
  }));

  const {
    getWebSocketId, register, unregister, closeSocket
  } = useWebSocketUpdateContext();
  const { runCommand } = useHistoryContext();
  const { fetchRunCommand } = useHistoryUpdateContext();

  const publishContainer = async () => {
    const wsid = getWebSocketId();
    const postBody = {
      name: containerInfo.name,
      cwd: runCommand?.cwd,
      entrypoint: runCommand?.command.split(' ') ?? [],
      listeners: [wsid],
    };

    console.debug(runCommand);

    await fetch(`/api/clouseau/docker/${workerNode}/commit/${containerInfo.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });
  };

  const run = async () => {
    console.debug(containerInfo);
    await publishContainer();
  };

  useEffect(() => {
    console.debug('bind docker/publish');

    const publishHandler = (data) => {
      const item = data.split(/\r?\n/).reduce((acc, s) => (s || acc));
      console.debug(item);
      const {
        error,
        status,
        aux: { Tag, Digest } = { Tag: null, Digest: null },
        progressDetail,
        progress
      } = JSON.parse(item);
      if (error) {
        console.error(error);
        setPublishInfo((p) => ({ ...p, publish: { status: 'error', message: error } }));
        throw new Error(error);
      } else if (Tag) {
        setPublishInfo((p) => ({
          ...p,
          tag: Tag,
          url: `https://hub.docker.com/layers/jataware/dojo-publish/${Tag}/images/${Digest.replaceAll(':', '-')}?context=repo`,
          publish: { status: 'finished', message: '' }
        }));
        setEnableFinished(true);
        setTotalProgress(100);
      } else {
        setPublishInfo((p) => ({ ...p, publish: { status, message: progress } }));
        if (progressDetail?.current) {
          const { current, total } = progressDetail;
          setTotalProgress(Math.min((current / total) * 100, 100).toFixed(2));
        }
      }
    };
    register('docker/publish', publishHandler);
    return (() => {
      console.debug('unbind docker/publish');
      unregister('docker/publish', publishHandler);
    });
  }, []);

  useEffect(() => {
    if (containerInfo?.id) {
      fetch(`/api/dojo/clouseau/container/${containerInfo.id}`).then((resp) => {
        if (resp.ok) {
          resp.json().then((c) => setContainer(c));
        }
      });
      fetchRunCommand(containerInfo.id);
    }
  }, [containerInfo]);

  useEffect(() => {
    if (runCommand?.command) {
      run();
    }
  }, [runCommand]);

  useEffect(() => {
    if (enableFinished) {
      console.debug('manually close socket');
      closeSocket();
      // link image to model
      fetch(`/api/dojo/models/${containerInfo.model_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: `jataware/dojo-publish:${publishInfo?.tag}` })
        });

      // register model
      fetch(`/api/dojo/models/register/${containerInfo.model_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

      // cleanup
      fetch(`/api/clouseau/docker/${workerNode}/stop/${containerInfo.id}`, { method: 'DELETE' });

      console.debug('%cPublished Info', 'background: #fff; color: #000');
      console.debug(publishInfo);
      console.debug('%cPublished Container', 'background: #fff; color: #000');
      console.debug(container);
    }
  }, [enableFinished]);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={open}>
        <div style={{ minHeight: '600px', width: '800px', paddingTop: '20px' }}>
          <div style={{ height: '20px' }}>
            Uploading to Docker Hub  [
            {' '}
            {totalProgress}
            % ]
          </div>

          <div style={{ padding: '15px 0' }}>
            <LinearProgress color="primary" variant="determinate" value={totalProgress} />
          </div>

          { enableFinished
            && (
            <>
              <div>
                <Link href={publishInfo?.url} target="_blank" rel="noreferrer" color="inherit">
                  View on docker.io
                  {' '}
                  {' '}
                  <OpenInNewIcon style={{ fontSize: '14px' }} />
                  {' '}
                  <span>
                    docker pull jataware/dojo-publish:
                    {publishInfo?.tag}
                  </span>
                </Link>
              </div>

              <div style={{ padding: '15px 5px' }}>
                <Button variant="contained" color="primary" onClick={() => history.push('/')}>
                  Back to Main
                </Button>
              </div>
            </>
            )}
        </div>
      </Backdrop>
    </div>
  );
};

const PublishContainer = () => {
  const { worker } = useParams();
  let proto = 'ws:';
  if (window.location.protocol === 'https:') {
    proto = 'wss:';
  }
  const url = `${proto}//${window.location.host}/api/ws/${worker}`;

  return (
    <ContainerInfoContextProvider workerNode={worker}>
      <WebSocketContextProvider url={url} autoConnect>
        <HistoryContextProvider>
          <Page workerNode={worker} />
        </HistoryContextProvider>
      </WebSocketContextProvider>
    </ContainerInfoContextProvider>
  );
};

export default PublishContainer;
