import React, { useEffect, useState } from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import SyncIcon from '@material-ui/icons/Sync';
import WarningIcon from '@material-ui/icons/Warning';

import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import {
  ContainerInfoContextProvider, HistoryContextProvider,
  useContainerInfoContext,
  useHistoryContext,
  useHistoryUpdateContext,
  useWebSocketContext,
  useWebSocketUpdateContext,
} from './context';

import BasicAlert from './components/BasicAlert';
import FullScreenDialog from './components/FullScreenDialog';
import SimpleEditor from './components/SimpleEditor';
import Term from './components/Term';
import { ContainerWebSocket, ShellHistory } from './components/ShellHistory';

import { findRunCommand } from './utils';

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
}));

export const ExecutionDialog = ({ open, setOpen, dialogContents }) => {
  const { setRunCommand } = useHistoryUpdateContext();
  const handleClose = async (isRunCommand) => {
    if (isRunCommand) {
      setRunCommand(dialogContents.text);
    }

    await fetch('/api/container/ops/clear?code=0');

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
          <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px' }} />
          Are you executing a model?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '10px',
              backgroundColor: '#445d6e',
              color: '#fff',
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
          <Button onClick={() => handleClose(true)} autoFocus color="primary">
            Yes
          </Button>
          <Button onClick={() => handleClose(false)} color="secondary">
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

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
          <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px' }} />
          Are you ready to publish the container?
        </DialogTitle>
        <DialogContent>
          Run Command
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '10px',
              backgroundColor: '#445d6e',
              color: '#fff',
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
          <Button onClick={() => handleClose(true)} autoFocus color="primary">
            Yes
          </Button>
          <Button onClick={() => handleClose(false)} color="secondary">
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
  const containerInfo = useContainerInfoContext();
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alert, setAlert] = React.useState({
    severity: 'error',
    message: ''
  });
  const [dialogContents, setDialogContents] = React.useState({});
  const [openDialog, setDialogOpen] = React.useState(false);
  const [openPublishDialog, setPublishDialogOpen] = React.useState(false);
  const [editorContents, setEditorContents] = React.useState({});
  const [openEditor, setOpenEditor] = React.useState(false);
  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const saveEditor = async () => {
    await fetch(`/api/container/ops/save?path=${editorContents.file}`, {
      method: 'POST',
      body: editorContents.text
    });

    await fetch(`/api/container/store/${containerInfo.id}/edits`, {
      method: 'PUT',
      body: JSON.stringify([editorContents.file])
    });
  };

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

  return (
    <div className={theme.root}>
      <Grid container spacing={1} style={{ width: 'auto', margin: 0 }}>
        <Grid item xs={8} style={{ padding: '0 2px', backgroundColor: '#272d33' }}>
          <Term />
        </Grid>

        <Grid item xs={4} style={{ padding: '0 2px' }}>
          <ShellHistory
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
          />
          <ContainerWebSocket
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
            setDialogOpen={setDialogOpen}
            setEditorContents={setEditorContents}
            openEditor={() => setOpenEditor(true)}
            setDialogContents={setDialogContents}
          />
          <ExecutionDialog
            open={openDialog}
            setOpen={setDialogOpen}
            dialogContents={dialogContents}
          />
          <Divider />

          <FullScreenDialog open={openFullScreen} setOpen={setOpenFullScreen}>
            <iframe title="itest" style={{ height: 'calc(100vh - 70px)', width: '100%' }} src="http://wttr.in" />
          </FullScreenDialog>

          <FullScreenDialog open={openEditor} setOpen={setOpenEditor} onSave={saveEditor} title={`Editing ${editorContents?.file}`}>
            <SimpleEditor editorContents={editorContents} setEditorContents={setEditorContents} />
          </FullScreenDialog>
        </Grid>
      </Grid>
      <BasicAlert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />

      <div style={{
        position: 'absolute', right: 0, bottom: '2px', zIndex: 10
      }}
      >
        <Fab
          variant="extended"
          color="primary"
          style={{ margin: '10px' }}
          onClick={(e) => { e.preventDefault(); setPublishDialogOpen(true); }}
        >
          End Session
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

const Publisher = () => {
  const historyContext = useHistoryContext();
  const containerInfo = useContainerInfoContext();
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
  const { getWebSocketId, register, unregister } = useWebSocketUpdateContext();

  useEffect(() => {
    console.log('bind docker/publish');

    const publishHandler = (data) => {
      const item = data.split(/\r?\n/).reduce((acc, s) => (s || acc));
      console.log(item);
      const {
        error,
        status,
        aux: { Tag, Digest } = { Tag: null, Digest: null },
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

  const handlePublish = async () => {
    const wsid = getWebSocketId();
    console.log(`listener: ${wsid}`);
    console.log(historyContext);

    const rc = findRunCommand(historyContext);
    setRunCommand(rc.text);
    const postBody = {
      name: containerInfo.name,
      cwd: rc.cwd,
      entrypoint: rc.text?.split(' ') ?? [],
      listeners: [wsid],
    };
    console.log(postBody);
    setOpenDialog(true);

    await fetch(`/api/docker/commit/${containerInfo.id}`, {
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
    await fetch(`/api/docker/stop/${containerInfo.id}`, { method: 'DELETE' });
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
                  color: '#fff',
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

const App = () => (
  <ContainerInfoContextProvider>
    <HistoryContextProvider>
      <Publisher />
    </HistoryContextProvider>
  </ContainerInfoContextProvider>
);

export default App;
