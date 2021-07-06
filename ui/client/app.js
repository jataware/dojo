import React, { useEffect, useState } from 'react';

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
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import SyncIcon from '@material-ui/icons/Sync';
import WarningIcon from '@material-ui/icons/Warning';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { useHistory, useParams } from 'react-router-dom';

import {
  ContainerInfoContextProvider,
  HistoryContextProvider,
  ModelInfoContextProvider,
  WebSocketContextProvider,
  useContainerInfoContext,
  useHistoryContext,
  useHistoryUpdateContext,
  useModelInfoContext,
} from './context';

import BasicAlert from './components/BasicAlert';
import FullScreenDialog from './components/FullScreenDialog';
import RunCommandBox from './components/RunCommandBox';
import SimpleEditor from './components/SimpleEditor';
import Term from './components/Term';
import { ContainerWebSocket, ShellHistory } from './components/ShellHistory';
import { ShorthandEditor, shorthandShouldLoad, shorthandShouldSave } from './components/ShorthandEditor';

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

export const ExecutionDialog = ({
  workerNode,
  open, setOpen, dialogContents,
  setIsShorthandOpen, setIsShorthandSaving, setShorthandContents, setShorthandMode
}) => {
  const { markRunCommand } = useHistoryUpdateContext();
  const containerInfo = useContainerInfoContext();
  const handleClose = async (isRunCommand) => {
    if (isRunCommand) {
      // listen for messages from shorthand iframe
      window.onmessage = function shorthandOnMessage(e) {
        let postMessageBody;

        try {
          postMessageBody = JSON.parse(e.data);
        } catch {
          return; // not a json event
        }

        if (postMessageBody.type === 'editor_loaded') {
          // editor has loaded, send in the command
          setShorthandContents({
            editor_content: dialogContents.command,
            content_id: dialogContents.command,
          });
        }
        if (postMessageBody.type === 'params_saved') {
          // console.log("Params Saved :)")
          setIsShorthandOpen(false);
          markRunCommand(containerInfo.id, dialogContents);
        }
        if (postMessageBody.type === 'params_not_saved') {
          // console.log("Params Not Saved :(")
          setIsShorthandOpen(true); // keep shorthand open
          setIsShorthandSaving(false); // stop the saving spinner
        }
      };

      setShorthandMode('directive');
      setIsShorthandSaving(false);
      setIsShorthandOpen(true);
    }
    await fetch(`/api/clouseau/container/${workerNode}/ops/clear?code=0`);
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
              <span>{dialogContents.command}</span>
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

export const EndSessionDialog = ({
  open, setOpen, runCommand, accept, reject
}) => {
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
            <span>{runCommand?.command}</span>
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

export const AbandonSessionDialog = ({
  open, accept, reject
}) => {
  const [isClosing, setClosing] = useState(false);
  const handleClose = async (yes) => {
    if (yes) {
      setClosing(true);
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
          Are you sure you want to abandon this session?
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            This will kill your terminal session and is not recoverable
          </DialogContentText>
          <div style={{ height: '20px', display: (isClosing) ? 'unset' : 'none' }}>
            <LinearProgress color="primary" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(true)} autoFocus color="primary" disabled={isClosing}>
            Yes
          </Button>
          <Button onClick={() => handleClose(false)} color="secondary" disabled={isClosing}>
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

const CenteredGrid = ({ workerNode }) => {
  const theme = useTheme();
  const containerInfo = useContainerInfoContext();
  const { runCommand } = useHistoryContext();
  const { fetchRunCommand } = useHistoryUpdateContext();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alert, setAlert] = useState({
    severity: 'error',
    message: ''
  });
  const [dialogContents, setDialogContents] = useState({});
  const [openDialog, setDialogOpen] = useState(false);
  const [openEndSessionDialog, setEndSessionDialogOpen] = useState(false);
  const [openAbandonSessionDialog, setAbandonSessionDialogOpen] = useState(false);
  const [editorContents, setEditorContents] = useState({});
  const [openEditor, setOpenEditor] = useState(false);
  const [isShorthandOpen, setIsShorthandOpen] = useState(false);

  const [isShorthandSaving, setIsShorthandSaving] = useState(false);
  const [shorthandContents, setShorthandContents] = useState({});
  const [shorthandMode, setShorthandMode] = useState({});

  const history = useHistory();
  const modelInfo = useModelInfoContext();

  const handleAbandonSession = async () => {
    // yolo
    fetch(`/api/clouseau/docker/${workerNode}/stop/${containerInfo.id}`, { method: 'DELETE' });
    history.push('/');
  };

  const handleEndSession = () => {
    // go to summary screen
    history.push(`/summary/${workerNode}`, containerInfo);
  };

  useEffect(() => {
    if (containerInfo) {
      fetchRunCommand(containerInfo.id);
    }
  }, [containerInfo]);

  useEffect(() => {
    if (shorthandContents) {
      shorthandShouldLoad(shorthandContents);
    }
  }, [shorthandContents]);

  useEffect(() => {
    if (isShorthandSaving) {
      shorthandShouldSave();
    }
  }, [isShorthandSaving]);

  const setIsShorthandSavingForFullScreenDialog = () => {
    setIsShorthandSaving(true);
    return false; // don't close FullScreenDialog
  };

  const saveEditor = async () => {
    await fetch(`/api/clouseau/container/${workerNode}/ops/save?path=${editorContents.file}`, {
      method: 'POST',
      body: editorContents.text
    });

    await fetch(`/api/clouseau/container/store/${containerInfo.id}/edits`, {
      method: 'PUT',
      body: JSON.stringify(editorContents)
    });
    return true; // should close FullScreenDialog
  };

  return (
    <div className={theme.root} style={{ backgroundColor: '#272d33' }}>
      <Grid container spacing={1} style={{ width: 'auto', margin: 0 }}>
        <Grid item xs={8} style={{ padding: '0 2px', backgroundColor: '#272d33' }}>
          <Term />
        </Grid>

        <Grid item xs={4} style={{ padding: '0 5px 0 0', zIndex: 5 }}>
          <ShellHistory
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
          />
          <ContainerWebSocket
            workerNode={workerNode}
            setAlert={setAlert}
            setAlertVisible={setAlertVisible}
            setDialogOpen={setDialogOpen}
            setEditorContents={setEditorContents}
            openEditor={() => setOpenEditor(true)}
            setDialogContents={setDialogContents}
            setIsShorthandOpen={setIsShorthandOpen}
            setIsShorthandSaving={setIsShorthandSaving}
            setShorthandContents={setShorthandContents}
            setShorthandMode={setShorthandMode}
          />
          <ExecutionDialog
            workerNode={workerNode}
            open={openDialog}
            setOpen={setDialogOpen}
            setIsShorthandOpen={setIsShorthandOpen}
            setIsShorthandSaving={setIsShorthandSaving}
            setShorthandContents={setShorthandContents}
            setShorthandMode={setShorthandMode}
            dialogContents={dialogContents}
          />
          <Divider />
          <RunCommandBox command={runCommand} />

          <FullScreenDialog
            open={isShorthandOpen}
            setOpen={setIsShorthandOpen}
            onSave={setIsShorthandSavingForFullScreenDialog}
          >
            <ShorthandEditor
              modelInfo={modelInfo}
              isSaving={isShorthandSaving}
              mode={shorthandMode}
            />
          </FullScreenDialog>

          <FullScreenDialog
            open={openEditor}
            setOpen={setOpenEditor}
            onSave={saveEditor}
            title={`Editing ${editorContents?.file}`}
          >
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
          onClick={(e) => { e.preventDefault(); setEndSessionDialogOpen(true); }}
        >
          End Session
        </Fab>

        <Fab
          variant="extended"
          color="secondary"
          style={{ margin: '10px' }}
          onClick={(e) => { e.preventDefault(); setAbandonSessionDialogOpen(true); }}
        >
          Abandon Session
        </Fab>

      </div>
      <AbandonSessionDialog
        open={openAbandonSessionDialog}
        accept={handleAbandonSession}
        reject={() => { setAbandonSessionDialogOpen(false); }}
      />
      <EndSessionDialog
        open={openEndSessionDialog}
        setOpen={setEndSessionDialogOpen}
        runCommand={runCommand}
        accept={handleEndSession}
        reject={() => {}}
      />
    </div>
  );
};

const App = () => {
  const { worker, modelid } = useParams();
  const [model, setModel] = useState(() => null);

  let proto = 'ws:';
  if (window.location.protocol === 'https:') {
    proto = 'wss:';
  }
  const url = `${proto}//${window.location.host}/api/ws/${worker}`;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetch(`/api/dojo/models/${modelid}`).then((r) => r.json().then((m) => {
      console.debug(m);
      setModel(m);
      setIsLoading(false);
    })).catch(() => {
      setHasError(true);
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      { isLoading ? <div> loading ... </div>
        : hasError ? <div> error ... </div>
          : (
            <ModelInfoContextProvider model={model}>
              <ContainerInfoContextProvider workerNode={worker}>
                <WebSocketContextProvider url={url} autoConnect>
                  <HistoryContextProvider>
                    <CenteredGrid workerNode={worker} />
                  </HistoryContextProvider>
                </WebSocketContextProvider>
              </ContainerInfoContextProvider>
            </ModelInfoContextProvider>
          )}
    </>
  );
};

export default App;
