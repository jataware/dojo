import React, { useEffect, useState } from 'react';

import Backdrop from '@material-ui/core/Backdrop';
import Button from '@material-ui/core/Button';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
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
import Link from '@material-ui/core/Link';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Paper from '@material-ui/core/Paper';
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
  SocketIOClientContextProvider,
  HistoryContextProvider,
  useHistoryContext,
  useHistoryUpdateContext,
  useSocketIOClient
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
        <Grid item xs={8}>
          <Term setSocketIoConnected={setSocketIoConnected} />
        </Grid>

        <Grid item xs={4}>
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
  const ioclient = useSocketIOClient();
  const [openBackdrop, setOpenBackdrop] = React.useState(false);
  const [allowCloseBackdrop, setAllowCloseBackdrop] = React.useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [publishMessage, setPublishMessage] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [tagName, setTagName] = useState('');
  const [runCommand, setRunCommand] = useState('');

  useEffect(() => {
    console.log('bind docker_publish');
    ioclient.on('docker_publish', (data) => {
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
        setAllowCloseBackdrop(true);
      } else if (Tag) {
        setPublishStatus('finished');
        setPublishMessage('');
        setGithubLink(`https://hub.docker.com/layers/jataware/clouseau/${Tag}/images/${Digest.replaceAll(':', '-')}?context=repo`);
        setTagName(Tag);
        setAllowCloseBackdrop(true);
      } else {
        setPublishStatus(status);
        setPublishMessage(progress);
      }
    });

    return (() => {
      console.log('unbind docker_publish');
      ioclient.off('docker_publish');
    });
  }, []);

  const handlePublish = async (e) => {
    console.log(historyContext);
    const rc = findRunCommand(historyContext);
    setRunCommand(rc.text);
    const postBody = {
      cwd: rc.cwd,
      entrypoint: rc.text.split(' '),
    };
    console.log(postBody);
    await fetch('api/commit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    });
    setOpenBackdrop(true);
  };
  const handleClose = async () => {
    setAllowCloseBackdrop(false);
    await fetch('api/shutdown/container', { method: 'DELETE' });
    clearHistoryContext();
    setOpenBackdrop(false);
    history.push('/');
  };

  return (
    <div>
      <Backdrop className={classes.backdrop} open={openBackdrop}>
        <div style={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container justify="center" spacing={2}>
                <Grid item>
                  <Paper style={{
                    minHeight: 400, width: 600, padding: '20px', backgroundColor: 'black', color: 'white'
                  }}
                  >
                    <IconButton
                      variant="contained"
                      component="span"
                      disabled={!allowCloseBackdrop}
                      onClick={handleClose}
                      style={{ left: '-24px' }}
                    >
                      <CancelOutlinedIcon size="small" />
                    </IconButton>
                    <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      <div style={{ marginBottom: '5px' }}>{publishStatus}</div>
                      {!githubLink
                      && (
                      <div style={{ marginTop: '10px' }}>
                        {publishMessage}
                      </div>
                      )}
                      {githubLink
                       && (
                         <div>
                           <Link href={githubLink} target="_blank" rel="noreferrer">
                             {githubLink}
                           </Link>
                           <div style={{ paddingTop: '10px' }}>
                             docker pull jataware/clouseau:
                             {tagName}
                           </div>
                           <div style={{
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
                           </div>
                         </div>
                       )}
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Backdrop>
      <CenteredGrid handlePublish={handlePublish} />
    </div>
  );
};

const App = () => (
  <SocketIOClientContextProvider>
    <HistoryContextProvider>
      <Publisher />
    </HistoryContextProvider>
  </SocketIOClientContextProvider>
);

export default App;
