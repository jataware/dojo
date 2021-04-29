import React, { useEffect, useState } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SaveIcon from '@material-ui/icons/Save';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import SyncIcon from '@material-ui/icons/Sync';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Tooltip from '@material-ui/core/Tooltip';
import WarningIcon from '@material-ui/icons/Warning';

import { useHistory } from 'react-router-dom';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { Alert } from './alert';

import Term from './term';

import {
  useWebSocketContext, useWebSocketUpdateContext,
  HistoryContextProvider,
  useHistoryContext,
  useHistoryUpdateContext,
} from './context';

import { ContainerWebSocket, History } from './history';

/* eslint-disable no-unused-vars */
const useStyles = makeStyles((theme) => ({
  connected: {
    color: 'green'
  },
  disconnected: {
    color: 'red'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  textareaAutosize: {
    overflow: 'auto',
    height: '200px',
    width: '100%',
    color: '#fff',
    backgroundColor: '#000',
    borderWidth: 0,

    '&:focus': {
      outlineColor: '#000',
      outlineWidth: 0,
      boxShadow: '0 0 10px white',
    }
  },
}));

export const ExecutionDialog = ({ open, setOpen, dialogContents }) => {
  const historyContext = useHistoryContext();
  const { setRunCommand } = useHistoryUpdateContext();
  const handleClose = async (isRunCommand) => {
    if (isRunCommand) {
      setRunCommand(dialogContents.text);
    }

    await fetch('/container/clear?code=0');
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px', color: 'yellow' }} />
          Are you executing a model?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '10px',
              backgroundColor: '#445d6e',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {open && dialogContents && (
            <>
              <NavigateNextIcon style={{ color: 'yellow' }} />
              {' '}
              <span>{dialogContents.text}</span>
            </>

            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(true)} autoFocus>
            Yes
          </Button>
          <Button onClick={() => handleClose(false)}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const findRunCommand = (h) => h.find((x) => x.runCommand) || {};

export const PublishDialog = ({
  open, setOpen, accept, reject
}) => {
  const historyContext = useHistoryContext();
  const runCommand = findRunCommand(historyContext);

  const handleClose = async (yes) => {
    setOpen(false);
    if (yes) {
      accept();
    } else {
      reject();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px', color: 'yellow' }} />
          Are you ready to publish the container?
        </DialogTitle>
        <DialogContent>
          Run Command
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '10px',
              backgroundColor: '#445d6e',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <NavigateNextIcon style={{ color: 'yellow' }} />
            {' '}
            <span>{runCommand.text}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(true)} autoFocus>
            Yes
          </Button>
          <Button onClick={() => handleClose(false)}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export const Footer = ({ wsConnected, socketIoConnected }) => {
  const classes = useStyles();
  const style = {
    footer: {
      width: '100%',
      bottom: 0,
      position: 'absolute'
    },
    icon: {
      fontSize: '1.0rem',
      verticalAlign: 'middle',
    },
    paper: {
      padding: '4px',
      backgroundColor: '#000',
      color: '#fff'
    }
  };

  return (
    <Container style={style.footer}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container justify="flex-start" spacing={2}>
            <Grid item>
              <span>Terminal: </span>
              {socketIoConnected
                ? <SyncIcon className={classes.connected} style={style.icon} />
                : <SyncDisabledIcon className={classes.disconnected} style={style.icon} /> }
            </Grid>
            <Grid item>
              <span>Socket: </span>
              {wsConnected
                ? <SyncIcon className={classes.connected} style={style.icon} />
                : <SyncDisabledIcon className={classes.disconnected} style={style.icon} /> }

            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

const CenteredGrid = ({ handlePublish }) => {
  const theme = useTheme();
  const classes = useStyles();
  const inputRef = React.createRef();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alert, setAlert] = React.useState({
    severity: 'error',
    message: ''
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [socketIoConnected, setSocketIoConnected] = useState(false);
  const [dialogContents, setDialogContents] = React.useState({});
  const [openDialog, setDialogOpen] = React.useState(false);
  const [openPublishDialog, setPublishDialogOpen] = React.useState(false);
  const [editorContents, setEditorContents] = React.useState({});

  const { awaitEmit } = useWebSocketContext();

  useEffect(async () => {
    try {
      // testing socket connection
      const resp = await awaitEmit('ping', 'test', 'pong');
      console.log(resp);
    } catch (err) {
      console.log(err);
      throw (err);
    }
  }, []);

  const saveEditor = async () => {
    await fetch(`/container/save?path=${editorContents.file}`, {
      method: 'POST',
      body: editorContents.text
    });
  };

  const clearEditor = async () => {
    setEditorContents({});
  };

  const updateEditorContents = (e) => {
    setEditorContents((state) => ({
      ...state, text: e.target.value
    }));
  };

  return (
    <div className={theme.root}>
      <Grid container spacing={1} style={{ width: 'auto', margin: 0 }}>
        <Grid item xs={8} style={{ padding: '0 2px' }}>
          <Term setSocketIoConnected={setSocketIoConnected} />
        </Grid>

        <Grid item xs={4} style={{ padding: '0 2px' }}>
          <History
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
          />
          <ContainerWebSocket
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
            setWsConnected={setWsConnected}
            setSocketIoConnected={setSocketIoConnected}
            setDialogOpen={setDialogOpen}
            setEditorContents={setEditorContents}
            setDialogContents={setDialogContents}
          />
          <ExecutionDialog
            open={openDialog}
            setOpen={setDialogOpen}
            dialogContents={dialogContents}
          />
          <Divider />
          <div style={{ fontFamily: 'monospace' }}>
            <div style={{
              backgroundColor: 'black',
              color: 'white',
              display: 'flex',
              justifyContent: 'flex-start',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              alignContent: 'stretch',
              alignItems: 'flex-start',
              marginBottom: '10px',
            }}
            >
              <Tooltip title="edit" arrow style={{ alignSelf: 'auto' }}>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  style={{ alignSelf: 'auto', marginRight: '3px', padding: '2px' }}
                >
                  <EditIcon fontSize="small" />
                  {'  '}
                </IconButton>
              </Tooltip>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '12px', marginLeft: '5px' }}>
                  {editorContents?.file || ''}
                </span>
              </div>
              <Tooltip title="Clear" arrow>
                <IconButton
                  style={{
                    marginLeft: 'auto', alignSelf: 'auto', marginRight: '3px', padding: '2px'
                  }}
                  edge="end"
                  aria-label="clear"
                  onClick={clearEditor}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save" arrow>
                <IconButton
                  style={{
                    alignSelf: 'auto', marginRight: '3px', padding: '2px'
                  }}
                  edge="end"
                  aria-label="save"
                  onClick={saveEditor}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <TextareaAutosize
              rowsMin={10}
              rowsMax={10}
              placeholder=""
              value={editorContents?.text || ''}
              onChange={updateEditorContents}
              className={classes.textareaAutosize}
            />

          </div>
        </Grid>
      </Grid>
      <Alert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />
      <Footer wsConnected={wsConnected} socketIoConnected={socketIoConnected} />
      <div style={{
        position: 'absolute', right: 0, bottom: '2px', zIndex: 10
      }}
      >
        <Fab
          variant="extended"
          style={{ margin: '10px' }}
          onClick={(e) => { e.preventDefault(); setPublishDialogOpen(true); }}
        >
          Publish
        </Fab>
      </div>
      <PublishDialog
        open={openPublishDialog}
        setOpen={setPublishDialogOpen}
        accept={handlePublish}
        reject={() => {}}
      />
    </div>
  );
};

const Publisher = ({ children }) => {
  const classes = useStyles();
  const historyContext = useHistoryContext();
  const { clearHistoryContext } = useHistoryUpdateContext();
  const history = useHistory();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [enableFinished, setEnableFinished] = React.useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [publishMessage, setPublishMessage] = useState('');
  const [dockerhubLink, setDockerhubLink] = useState('');
  const [tagName, setTagName] = useState('');
  const [runCommand, setRunCommand] = useState('');
  const [containerId, setContainerId] = useState('');
  const [containerName, setContainerName] = useState('');
  const { getWebSocketId, register, unregister } = useWebSocketUpdateContext();

  useEffect(async () => {
    const respID = await fetch('/container/container');
    const { id } = await respID.json();
    console.log(`set container id ${id}`);
    setContainerId(id);

    const respName = await fetch(`/api/docker/inspect/${id}`);
    const { Name } = await respName.json();
    console.log(`set container Name ${Name}`);
    setContainerName(Name?.substring(1) ?? '');
  }, []);

  useEffect(async () => {
    console.log('bind docker/publish');

    const publishHandler = (data) => {
      const item = data.split(/\r?\n/).reduce((acc, s) => (s || acc));
      console.log(item);
      const {
        error,
        status,
        aux: { Tag, Digest } = { Tag: null, Digest: null },
        progressDetail: { current, total } = { current: '', total: '' },
        progress
      } = JSON.parse(item);
      if (error) {
        setPublishStatus('error');
        setPublishMessage(error);
        setEnableFinished(true);
      } else if (Tag) {
        setPublishStatus('finished');
        setEnableFinished(true);
        setPublishMessage('');
        setDockerhubLink(`https://hub.docker.com/layers/jataware/clouseau/${Tag}/images/${Digest.replaceAll(':', '-')}?context=repo`);
        setTagName(Tag);
      } else {
        setPublishStatus(status);
        setPublishMessage(progress);
      }
    };
    register('docker/publish', publishHandler);
    return (() => {
      console.log('unbind docker/publish');
      unregister('docker/publish', publishHandler);
    });
  }, []);

  const handlePublish = async (e) => {
    const wsid = getWebSocketId();
    console.log(`listener: ${wsid}`);
    console.log(historyContext);

    const rc = findRunCommand(historyContext);
    setRunCommand(rc.text);
    const postBody = {
      name: containerName,
      cwd: rc.cwd,
      entrypoint: rc.text.split(' '),
      listeners: [wsid],
    };
    console.log(postBody);
    setOpenDialog(true);

    await fetch(`api/docker/commit/${containerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });
  };
  const handleClose = async () => {
    setClosing(true);
    setEnableFinished(false);
    await fetch(`api/docker/stop/${containerId}`, { method: 'DELETE' });
    clearHistoryContext();
    history.push('/');
  };

  return (
    <div>
      <Dialog open={openDialog} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Publishing</DialogTitle>
        <DialogContent style={{ width: '600px' }}>
          {!dockerhubLink
            ? (
              <DialogContentText style={{
                backgroundColor: '#000', color: '#fff', padding: '7px', fontFamily: 'monospace', fontWeight: 'bold'
              }}
              >
                {publishStatus}
                <br />
                <span style={{ fontSize: '10px' }}>{publishMessage}</span>
              </DialogContentText>
            )
            : (
              <>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
                >
                  <Link href={dockerhubLink} target="_blank" rel="noreferrer" color="inherit">
                    <OpenInNewIcon style={{ fontSize: '14px' }} />
                    {' '}
                    <span>
                      docker pull jataware/clouseau:
                      {tagName}
                    </span>
                  </Link>
                </Box>
                <Box style={{
                  marginTop: '10px',
                  backgroundColor: '#445d6e',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
                >
                  <NavigateNextIcon style={{ color: 'yellow' }} />
                  {' '}
                  <span>{runCommand}</span>
                </Box>
              </>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={!enableFinished}>
            Finsihed
          </Button>
        </DialogActions>
        {closing && <LinearProgress />}
      </Dialog>
      <CenteredGrid handlePublish={handlePublish} />
    </div>
  );
};

// TODO bind new Websocket
const App = () => (
  <HistoryContextProvider>
    <Publisher />
  </HistoryContextProvider>
);

export default App;
