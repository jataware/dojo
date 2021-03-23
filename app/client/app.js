import React, { useEffect, useState } from 'react';

import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';

import Paper from '@material-ui/core/Paper';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import SyncIcon from '@material-ui/icons/Sync';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useTheme, makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

import Backdrop from '@material-ui/core/Backdrop';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router-dom';
import { Alert } from './alert';
import Term from './term';

import {
  SocketIOClientContextProvider,
  HistoryContextProvider,
  useHistoryContext,
  useHistoryUpdateContext,
  useSocketIOClient
} from './context';
import { HiddenWS, History } from './history';

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
}));

export const Footer = ({ wsConnected, socketIoConnected }) => {
  const classes = useStyles();
  const style = {
    footer: {
      width: '100%',
      bottom: 0,
      position: 'sticky'
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container justify="flex-end" spacing={3}>
            <Grid item>
              <Paper style={style.paper}>
                <span>Terminal: </span>
                {socketIoConnected
                  ? <SyncIcon className={classes.connected} style={style.icon} />
                  : <SyncDisabledIcon className={classes.disconnected} style={style.icon} /> }
              </Paper>
            </Grid>
            <Grid item>
              <Paper style={style.paper}>
                <span>Socket: </span>
                {wsConnected
                  ? <SyncIcon className={classes.connected} style={style.icon} />
                  : <SyncDisabledIcon className={classes.disconnected} style={style.icon} /> }
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

const CenteredGrid = () => {
  const theme = useTheme();
  const inputRef = React.createRef();
  const [openAlert, setOpenAlert] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alert, setAlert] = React.useState({
    severity: 'error',
    message: ''
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [socketIoConnected, setSocketIoConnected] = useState(false);

  return (
    <div className={theme.root}>
      <Grid container spacing={1} style={{ width: 'auto', margin: 0 }}>
        <Grid item xs={8}>
          <Paper className={theme.paper}>
            <Term setSocketIoConnected={setSocketIoConnected} />
          </Paper>
        </Grid>

        <Grid item xs={4}>
          <Paper className={theme.paper}>
            <History
              setAlert={setAlert}
              setAlertVisible={setAlertVisible}
            />
            <HiddenWS
              setAlert={setAlert}
              setAlertVisible={setAlertVisible}
              setWsConnected={setWsConnected}
              setSocketIoConnected={setSocketIoConnected}
            />
            <Divider />
          </Paper>
        </Grid>
      </Grid>
      <Alert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />
      <Footer wsConnected={wsConnected} socketIoConnected={socketIoConnected} />
    </div>

  );
};

const Top = () => {
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

  const findRunCommand = (h) => {
    const { text } = h.find((x) => x.runCommand) || {};
    return text || '';
  };

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
    e.preventDefault();
    console.log(historyContext);
    setRunCommand(findRunCommand(historyContext));
    await fetch('api/commit', { method: 'PUT' });
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
      <AppBar position="static" style={{ backgroundColor: 'black', color: 'white' }}>
        <Toolbar style={{ flexGrow: 1 }}>
          <Typography style={{ flexGrow: 1 }}>
            Clouseau
          </Typography>
          <Button variant="contained" onClick={handlePublish}>Publish Container</Button>
        </Toolbar>
      </AppBar>
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
    </div>
  );
};

const App = () => (
  <SocketIOClientContextProvider>
    <HistoryContextProvider>
      <Top />
      <CenteredGrid />
    </HistoryContextProvider>
  </SocketIOClientContextProvider>
);

export default App;
