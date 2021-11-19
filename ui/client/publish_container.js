import React, { useEffect, useState } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

// import { v4 as uuidv4 } from 'uuid';

import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';

import { useContainerWithWorker, useDirective } from './components/SWRHooks';

import {
  WebSocketContextProvider,
  useWebSocketUpdateContext,
} from './context';

import { sleep } from './utils';

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

const imageTags = (name) => {
  const d = Intl.DateTimeFormat(
    'en-US',
    {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      seconds: 'numeric',
      hour12: false,
      timeZone: 'utc'
    }
  ).formatToParts(new Date()).reduce((acc, { type, value }) => ({ [type]: value, ...acc }), {});

  const sDate = `${d.year}${d.month}${d.day}.${d.hour}${d.minute}`;
  const imagePrefix = process.env.NODE_ENV === 'development' ? 'dojo-test' : 'dojo-publish';
  return [`${imagePrefix}:${name}-${sDate}`, `${imagePrefix}:${name}-latest`];
};

const Page = ({ workerNode }) => {
  const { container } = useContainerWithWorker(workerNode);
  const classes = useStyles();
  const [open] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [enableFinished, setEnableFinished] = useState(false);
  const [publishInfo, setPublishInfo] = useState(() => ({
    publish: { status: '', message: '' },
    url: '',
    digest: '',
    image: '',
  }));

  const {
    getWebSocketId, register, unregister, closeSocket
  } = useWebSocketUpdateContext();

  const { directive } = useDirective(container?.model_id);

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
        progress,
        finished,
      } = JSON.parse(item);
      if (error) {
        console.error(error);
        setPublishInfo((p) => ({ ...p, publish: { status: 'error', message: error } }));
        throw new Error(error);
      } else if (Tag) {
        if (!Tag.endsWith('-latest')) {
          setPublishInfo((p) => ({ ...p, digest: Digest }));
        }
      } else if (finished) {
        // eslint-disable-next-line no-unused-vars
        const [image, ..._] = finished;
        setPublishInfo((p) => ({
          ...p,
          image,
          url: `https://hub.docker.com/layers/${image.replaceAll(':', '/')}/images/${p.digest.replaceAll(':', '-')}?context=repo`,
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
  }, [register, unregister]);

  useEffect(() => {
    const publishContainer = async (wsid) => {
      const postBody = {
        tags: imageTags(container.name),
        cwd: directive?.cwd,
        entrypoint: [],
        listeners: [wsid],
      };

      console.debug(directive);
      console.debug('start publish');
      console.debug(postBody);
      await fetch(`/api/clouseau/docker/${workerNode}/commit/${container.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody)
      });
    };

    const run = async () => {
      let wsid = getWebSocketId();
      console.debug(`wsid = ${wsid}`);
      while (wsid == null) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(50);
        wsid = getWebSocketId();
        console.debug(`sleep 50 wsid = ${wsid}`);
      }
      await publishContainer(wsid);
    };

    if (directive?.command) {
      console.debug('Run');
      run();
    }
  }, [directive, getWebSocketId, container, workerNode]);

  useEffect(() => {
    if (enableFinished) {
      console.debug('manually close socket');
      closeSocket();

      console.debug('patching model');
      // link image to model
      fetch(`/api/dojo/models/${container.model_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: publishInfo?.image })
        }).then(() => {
        console.debug('registering model');
        // register model
        fetch(`/api/dojo/models/register/${container.model_id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      });

      // cleanup
      fetch(`/api/clouseau/docker/${workerNode}/stop/${container.id}`, { method: 'DELETE' });

      console.debug('%cPublished Info', 'background: #fff; color: #000');
      console.debug(publishInfo);
      console.debug('%cPublished Container', 'background: #fff; color: #000');
      console.debug(container);
    }
  }, [enableFinished, container, publishInfo, workerNode, closeSocket]);

  const completeNav = async () => {
    const resp = await fetch(`/api/dojo/models/${container.model_id}`);
    const model = await resp.json();
    const url = `https://causemos.uncharted.software/#/model/${model.family_name}/model-publishing-experiment?datacube_id=${model.id}`;
    window.location.replace(url);
  };

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
                    docker pull
                    {' '}
                    {publishInfo?.image}
                  </span>
                </Link>
              </div>

              <div style={{ padding: '15px 5px' }}>
                <Button variant="contained" color="primary" onClick={completeNav}>
                  Publish in CauseMos
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
    <WebSocketContextProvider url={url} autoConnect>
      <Page workerNode={worker} />
    </WebSocketContextProvider>
  );
};

export default PublishContainer;
