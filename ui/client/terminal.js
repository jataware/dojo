import React, { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';

import { makeStyles } from '@material-ui/core/styles';

import { useHistory, useParams } from 'react-router-dom';

import {
  WebSocketContextProvider,
} from './context';

import ConfirmDialog from './components/ConfirmDialog';
import ContainerWebSocket from './components/ContainerWebSocket';
import DirectiveBox from './components/DirectiveBox';
import FullScreenDialog from './components/FullScreenDialog';
import LoadingOverlay from './components/LoadingOverlay';
import ModelFileTabs from './components/ModelFileTabs';
import ShellHistory from './components/ShellHistory';
import ShorthandEditor from './components/ShorthandEditor';
import SimpleEditor from './components/SimpleEditor';
import Term from './components/Term';
import { ThemeContext } from './components/ThemeContextProvider';
import UploadFileDialog from './components/UploadFileDialog';
import {
  useLock, useModel, useOutputFiles
} from './components/SWRHooks';

const useStyles = makeStyles((theme) => ({
  pageRoot: {
    backgroundColor: '#272d33',
  },
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
  fabWrapper: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    zIndex: 10,
    '& > *': {
      margin: [[0, theme.spacing(2), theme.spacing(2), 0]],
    },
  },
  rightColumnWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    paddingBottom: theme.spacing(3),
  },
  directiveContainer: {
    margin: [[0, 0, theme.spacing(1), theme.spacing(1)]],
  },
}));

const CenteredGrid = ({ model }) => {
  const classes = useStyles();

  const { mutateOutputs } = useOutputFiles(model.id);

  const [openAbandonSessionDialog, setAbandonSessionDialogOpen] = useState(false);
  const [editorContents, setEditorContents] = useState({});
  const [openEditor, setOpenEditor] = useState(false);
  const [isSpacetagOpen, setIsSpacetagOpen] = useState(false);
  const [spacetagUrl, setSpacetagUrl] = useState('');
  const [spacetagFile, setSpacetagFile] = useState('');
  const [openFileUploadDialog, setUploadFilesOpen] = useState(false);
  const [uploadPath, setUploadPath] = useState('');
  // the following control the state of the ShorthandEditor
  // opens the FullScreenDialog that holds the shorthand iframe
  const [isShorthandOpen, setIsShorthandOpen] = useState(false);
  // triggers shorthand to save on click
  const [isShorthandSaving, setIsShorthandSaving] = useState(false);
  // loads contents into the shorthand iframe
  const [shorthandContents, setShorthandContents] = useState({});
  // modes: 'directive', 'config'
  const [shorthandMode, setShorthandMode] = useState({});

  const history = useHistory();

  const handleAbandonSession = () => {
    axios.delete(`/api/clouseau/docker/${model.id}/release`).then(() => {
      history.push(`/summary/${model.id}`);
    }).catch((error) => {
      console.log('There was an error shutting down the container: ', error);
      setAbandonSessionDialogOpen(false);
    });
  };

  const shorthandDialogOnSave = () => {
    // trigger ShorthandEditor to tell the shorthand app to save
    setIsShorthandSaving(true);
    return false; // don't close FullScreenDialog
  };

  const saveEditor = async () => {
    await fetch(`/api/clouseau/container/${model.id}/ops/save?path=${editorContents.file}`, {
      method: 'POST',
      body: editorContents.text
    });

    return true; // should close FullScreenDialog
  };

  const handleDirectiveClick = (directive) => {
    setShorthandContents({
      editor_content: directive?.command_raw,
      content_id: directive?.command_raw,
      cwd: directive?.cwd,
    });
    setShorthandMode('directive');
    setIsShorthandOpen(true);
  };

  useEffect(() => {
    // Listen to message from child window for spacetag
    const handleEvent = (e) => {
      const key = e.message ? 'message' : 'data';
      const data = e[key];
      if (data === 'closeSpacetag') {
        setIsSpacetagOpen(false);
        // check for new spacetag files, but wait 1s for elasticsearch to catch up
        setTimeout(() => mutateOutputs(), 1000);
      }
    };
    window.addEventListener('message', handleEvent);
    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, [mutateOutputs]);

  useEffect(() => {
    // Clear any shutdown timers for this model if we're coming back from the summary page
    // returns a 404 if there are none to cancel (if we aren't coming from summary)
    axios.delete(`/api/clouseau/docker/${model.id}/shutdown`)
      .then(() => console.debug('Cancelling container auto-shutdown timer'))
      .catch(() => console.debug('No auto-shutdown timers found to cancel'));
  }, [model.id]);

  return (
    <div className={classes.pageRoot}>
      <Grid container spacing={1} style={{ width: 'auto', margin: 0 }}>
        <Grid item xs={7} xl={8} style={{ padding: '0 8px' }}>
          <Term />
        </Grid>

        <Grid item xs={5} xl={4} style={{ padding: '0 5px 0 0', zIndex: 5 }}>
          <div className={classes.rightColumnWrapper}>
            <ShellHistory
              modelId={model.id}
              setIsShorthandOpen={setIsShorthandOpen}
              setIsShorthandSaving={setIsShorthandSaving}
              setShorthandContents={setShorthandContents}
              setShorthandMode={setShorthandMode}
            />
            <ContainerWebSocket
              modelId={model.id}
              setEditorContents={setEditorContents}
              openEditor={() => setOpenEditor(true)}
              setIsShorthandOpen={setIsShorthandOpen}
              setIsShorthandSaving={setIsShorthandSaving}
              setShorthandContents={setShorthandContents}
              setShorthandMode={setShorthandMode}
              setIsSpacetagOpen={setIsSpacetagOpen}
              setSpacetagUrl={setSpacetagUrl}
              setSpacetagFile={setSpacetagFile}
              setUploadFilesOpen={setUploadFilesOpen}
              setUploadPath={setUploadPath}
            />
            <div className={classes.directiveContainer}>
              <DirectiveBox modelId={model.id} handleClick={handleDirectiveClick} />
            </div>

            <ModelFileTabs
              model={model}
              setShorthandMode={setShorthandMode}
              setShorthandContents={setShorthandContents}
              setOpenShorthand={setIsShorthandOpen}
              setSpacetagOpen={setIsSpacetagOpen}
              setSpacetagFile={setSpacetagFile}
            />
          </div>
        </Grid>
      </Grid>

      <div className={classes.fabWrapper}>
        <Fab
          variant="extended"
          color="secondary"
          onClick={(e) => { e.preventDefault(); setAbandonSessionDialogOpen(true); }}
        >
          Abandon Session
        </Fab>

        <Fab
          data-test="terminalEndSessionBtn"
          variant="extended"
          color="primary"
          onClick={() => history.push(`/summary/${model.id}?terminal=true`, { upload: true })}
        >
          Save and Continue
        </Fab>

      </div>

      <FullScreenDialog
        open={isShorthandOpen}
        setOpen={setIsShorthandOpen}
        onSave={shorthandDialogOnSave}
      >
        <ShorthandEditor
          modelInfo={model}
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
        title={`${spacetagFile?.name || spacetagFile}`}
      >
        <iframe
          id="spacetag"
          title="spacetag"
          style={{ height: 'calc(100vh - 70px)', width: '100%' }}
          src={
            spacetagFile?.id
              ? `/api/spacetag/overview/${spacetagFile?.id}?reedit=true`
              : spacetagUrl
          }
        />
      </FullScreenDialog>
      <ConfirmDialog
        open={openAbandonSessionDialog}
        accept={handleAbandonSession}
        reject={() => { setAbandonSessionDialogOpen(false); }}
        title="Are you sure you want to abandon this session?"
        body="This will kill your terminal session and is not recoverable.
        Any unsaved changes will be lost."
      />
      { openFileUploadDialog
        && (
        <UploadFileDialog
          open={openFileUploadDialog}
          closeDialog={() => { setUploadFilesOpen(false); }}
          modelID={model.id}
          uploadPath={uploadPath}
        />
        )}
    </div>
  );
};

const Terminal = () => {
  const { modelid } = useParams();
  const worker = 0;

  // we only care if lock is loading or doesn't exist
  const { lockLoading, lockError } = useLock(modelid);
  const { model, modelLoading, modelError } = useModel(modelid);

  const { setShowNavBar } = useContext(ThemeContext);

  // do this before we show the loading overlay so we don't see a flicker of the navbar
  useEffect(() => {
    // hide the navbar when the component mounts
    setShowNavBar(false);
    // when the component unmounts, toggle the navbar back
    return () => setShowNavBar(true);
  }, [setShowNavBar]);

  let proto = 'ws:';
  if (window.location.protocol === 'https:') {
    proto = 'wss:';
  }
  const url = `${proto}//${window.location.host}/api/ws/${modelid}`;

  useEffect(() => {
    document.title = 'Terminal - Dojo';
  }, []);

  if (modelLoading || lockLoading) {
    return <LoadingOverlay text="Loading terminal" />;
  }

  if (modelError || lockError) {
    return (
      <LoadingOverlay
        text="There was an error loading the terminal"
        error={modelError || lockError}
        link={{
          text: 'Go to the model summary page',
          href: `/summary/${modelid}`
        }}
      />
    );
  }

  return (
    <WebSocketContextProvider url={url}>
      <CenteredGrid workerNode={worker} model={model} />
    </WebSocketContextProvider>
  );
};

export default Terminal;
