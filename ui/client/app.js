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

import FullScreenDialog from './components/FullScreenDialog';
import RunCommandBox from './components/RunCommandBox';
import ShorthandEditor from './components/ShorthandEditor';
import SimpleEditor from './components/SimpleEditor';
import Term from './components/Term';
import { ContainerWebSocket, ShellHistory } from './components/ShellHistory';

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
          <Button
            autoFocus
            color="primary"
            data-test="terminalSubmitConfirmBtn"
            onClick={() => handleClose(true)}
          >
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

  const [openEndSessionDialog, setEndSessionDialogOpen] = useState(false);
  const [openAbandonSessionDialog, setAbandonSessionDialogOpen] = useState(false);
  const [editorContents, setEditorContents] = useState({});
  const [openEditor, setOpenEditor] = useState(false);
  const [isSpacetagOpen, setIsSpacetagOpen] = useState(false);
  const [spacetagUrl, setSpacetagUrl] = useState('');
  const [spacetagFile, setSpacetagFile] = useState('');

  // the following control the state of the ShorthandEditor
  // opens the FullScreenDialog that holds the shorthand iframe
  const [isShorthandOpen, setIsShorthandOpen] = useState(false);
  // triggers shorthand to save on click
  const [isShorthandSaving, setIsShorthandSaving] = useState(false);
  // loads contents into the shorthand iframe
  const [shorthandContents, setShorthandContents] = useState({});
  // modes: 'directive', 'config'
  const [shorthandMode, setShorthandMode] = useState({});

  // the command to pass into ShorthandEditor when we're marking a directive
  const [directive, setDirective] = useState({});

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

  const shorthandDialogOnSave = () => {
    // trigger ShorthandEditor to tell the shorthand app to save
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
            setIsShorthandOpen={setIsShorthandOpen}
            setIsShorthandSaving={setIsShorthandSaving}
            setShorthandContents={setShorthandContents}
            setShorthandMode={setShorthandMode}
            setDirective={setDirective}
          />
          <ContainerWebSocket
            workerNode={workerNode}
            setEditorContents={setEditorContents}
            openEditor={() => setOpenEditor(true)}
            setIsShorthandOpen={setIsShorthandOpen}
            setIsShorthandSaving={setIsShorthandSaving}
            setShorthandContents={setShorthandContents}
            setShorthandMode={setShorthandMode}
            setIsSpacetagOpen={setIsSpacetagOpen}
            setSpacetagUrl={setSpacetagUrl}
            setSpacetagFile={setSpacetagFile}
          />
          <Divider />
          <RunCommandBox command={runCommand} />

          <FullScreenDialog
            open={isShorthandOpen}
            setOpen={setIsShorthandOpen}
            onSave={shorthandDialogOnSave}
          >
            <ShorthandEditor
              directive={directive}
              modelInfo={modelInfo}
              isSaving={isShorthandSaving}
              setIsSaving={setIsShorthandSaving}
              mode={shorthandMode}
              shorthandContents={shorthandContents}
              setIsShorthandOpen={setIsShorthandOpen}
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

          <FullScreenDialog
            open={isSpacetagOpen}
            setOpen={setIsSpacetagOpen}
            onSave={() => {}}
            showSave={false}
            title={`${spacetagFile}`}
          >
            <iframe
              id="spacetag"
              title="spacetag"
              style={{ height: 'calc(100vh - 70px)', width: '100%' }}
              src={spacetagUrl}
            />
          </FullScreenDialog>
        </Grid>
      </Grid>

      <div style={{
        position: 'absolute', right: 0, bottom: '2px', zIndex: 10
      }}
      >
        <Fab
          data-test="terminalEndSessionBtn"
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
