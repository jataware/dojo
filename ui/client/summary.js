import React, { useEffect, useState } from 'react';

import AppBar from '@material-ui/core/AppBar';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import RunCommandBox from './components/RunCommandBox';

import {
  ContainerInfoContextProvider, HistoryContextProvider,
  useContainerInfoContext,
} from './context';

const useStyles = makeStyles((theme) => ({
  textareaAutosize: {
    overflow: 'auto',
    height: '200px',
    width: '100%',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 0,

    '&:focus': {
      outlineColor: '#fff',
      outlineWidth: 0,
      boxShadow: '0 0 10px #0c0c0c',
    }
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridGap: '2px',
  },
  title: {
    fontSize: '18px',
    padding: '4px'
  },
  typo: {
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    padding: '0 5px',
  },
  editor: {
    height: '400px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#000',
    overflow: 'scroll',
  },
  paper: {
    padding: '4px',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    marginBottom: theme.spacing(1),
  },
  fileName: {
    color: '#000',
    fontSize: '14px'
  },
  filePath: {
    fontSize: '10px'
  },
  command: {
    color: '#000',
    fontSize: '14px'
  },
  cwd: {
    fontSize: '10px'
  },
  p: {
    '&:hover': {
      backgroundColor: '#ccc',
    },
    '&:active': {
      backgroundColor: '#444',
    }
  },
  divider: {
    margin: theme.spacing(1, 0),
  },
}));

const Page = ({ workerNode }) => {
  const containerInfo = useContainerInfoContext();
  const history = useHistory();
  const [container, setContainer] = useState(() => ({
    history: [],
    edits: [],
  }));

  const [editor, setEditor] = useState(() => ({
    text: ''
  }));

  const classes = useStyles();

  const fetchContainer = async (containerId) => {
    const resp = await fetch(`/api/dojo/clouseau/container/${containerId}`);
    if (resp.ok) {
      const c = await resp.json();
      setContainer(c);
    }
  };

  const editHistoryHandler = (item) => {
    setEditor((p) => ({ ...p, text: item.command }));
  };

  const editEditHandler = (item) => {
    setEditor((p) => ({ ...p, text: item.text }));
  };

  const updateEditor = (e) => {
    setEditor((state) => ({ ...state, text: e.target.value }));
  };

  useEffect(() => {
    if (containerInfo?.id) {
      fetchContainer(containerInfo?.id);
    }
  }, [containerInfo]);

  const publishContainer = () => {
    history.push(`/publishcontainer/${workerNode}`, containerInfo);
  };

  const FileTile = ({ item }) => {
    const fileParts = new URL(`file://${item.file}`).pathname.split('/');
    const fileName = fileParts.pop();
    const filePath = fileParts.join('/').replace('/home/clouseau/', '~/');
    return (
      <>
        <span className={classes.fileName}>{fileName}</span>
        <p className={classes.filePath}>{filePath}</p>
      </>
    );
  };

  const EditTile = ({ item }) => {
    const cwd = item?.cwd.replace('/home/clouseau', '~');
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: 1 }}>
          <span className={classes.command}>{item.command}</span>
          <p className={classes.cwd}>{cwd}</p>
        </div>
        <IconButton aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </div>
    );
  };

  return (
    <>
      <AppBar position="static">
        <Typography className={classes.title}>
          Summary
        </Typography>
      </AppBar>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Typography className={classes.typo}>
            History
          </Typography>
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {container.history.map((v) => (
              <Paper
                key={v.idx}
                className={`${classes.paper} ${classes.p}`}
                onClick={() => editHistoryHandler(v)}
              >
                <EditTile item={v} />
              </Paper>
            ))}
          </div>
        </Grid>
        <Grid item xs={3}>
          <Typography className={classes.typo}>
            File Edits
          </Typography>
          <div style={{ maxHeight: '500px', overflow: 'auto', fontSize: '10px' }}>
            {container.edits.map((v) => (
              <Paper
                key={v.idx}
                className={`${classes.paper} ${classes.p}`}
                onClick={() => editEditHandler(v)}
              >
                <FileTile item={v} />
              </Paper>
            ))}
          </div>
        </Grid>
        <Grid item xs={6}>
          <div>
            <div style={{ paddingBottom: '8px' }}>
              <Typography className={classes.typo}>
                Run Command
              </Typography>
              <RunCommandBox
                command={{ command: container?.run_command, cwd: container?.run_cwd }}
              />
            </div>

            <Typography className={classes.typo}>
              Editor
            </Typography>

            <div className={classes.editor}>
              <TextareaAutosize
                rowsMin={25}
                placeholder=""
                onChange={updateEditor}
                className={classes.textareaAutosize}
                value={editor?.text || ''}
              />
            </div>

          </div>
        </Grid>
      </Grid>

      <div style={{
        position: 'absolute', right: 0, bottom: '2px', zIndex: 10
      }}
      >
        <Fab
          variant="extended"
          color="primary"
          style={{ margin: '10px' }}
          onClick={(e) => { e.preventDefault(); publishContainer(); }}
        >
          Publish
        </Fab>
      </div>

    </>
  );
};

const Summary = () => {
  const { worker } = useParams();
  return (
    <ContainerInfoContextProvider workerNode={worker}>
      <HistoryContextProvider>
        <Page workerNode={worker} />
      </HistoryContextProvider>
    </ContainerInfoContextProvider>
  );
};

export default Summary;
