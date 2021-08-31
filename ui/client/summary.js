import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { darken, makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import FullScreenDialog from './components/FullScreenDialog';
import { ModelSummaryEditor } from './components/ModelSummaryEditor';
import RunCommandBox from './components/RunCommandBox';
import ShorthandEditor from './components/ShorthandEditor';
import SimpleEditor from './components/SimpleEditor';

import { useConfigs, useContainer, useModel } from './components/SWRHooks';

import {
  ContainerInfoContextProvider,
  HistoryContextProvider,
  useContainerInfoContext,
} from './context';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  textareaAutosize: {
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(1),
    borderRadius: '5px',
    borderWidth: 0,
    width: '100%',
    '&:focus': {
      outlineColor: '#fff',
      outlineWidth: 0,
      boxShadow: '0 0 10px #0c0c0c',
    },
  },
  tilePanel: {
    maxHeight: '400px',
    overflow: 'auto',
    fontSize: '10px',
    '& > *': {
      marginRight: '2px',
    },
  },
  sectionHeader: {
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    padding: '0 5px',
  },
  paper: {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
    padding: '4px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: darken(theme.palette.grey[300], 0.1),
    },
  },
  fileName: {
    color: '#000',
    fontSize: '14px'
  },
  filePath: {
    fontSize: '10px'
  },
  publishButton: {
    position: 'absolute',
    right: 0,
    bottom: '2px',
    zIndex: 10
  },
  subsection: {
    marginLeft: theme.spacing(1),
  },
  modelHeader: {
    fontWeight: 'bold',
  },
  modelEditButton: {
    float: 'right',
    backgroundColor: theme.palette.grey[400],
  },
}));

const Page = ({ workerNode }) => {
  const containerInfo = useContainerInfoContext();
  const history = useHistory();
  const {
    container, containerIsLoading, containerIsError, mutateContainer
  } = useContainer(containerInfo?.id);
  const { model, modelIsLoading, modelIsError } = useModel(container?.model_id);
  const { configs, configsLoading, configsError } = useConfigs(container?.model_id);

  const [openEditor, setOpenEditor] = useState(false);
  const [editor, setEditor] = useState(() => ({
    text: '', file: ''
  }));

  const [openShorthand, setOpenShorthand] = useState(false);
  const [isShorthandSaving, setIsShorthandSaving] = useState(false);
  const [shorthandContents, setShorthandContents] = useState({});
  const [shorthandMode, setShorthandMode] = useState();

  const [openModelEdit, setOpenModelEdit] = useState(false);

  const classes = useStyles();

  const openConfigShorthand = async (item) => {
    const response = await fetch(
      `/api/clouseau/container/${workerNode}/ops/cat?path=${item.path}`
    );

    if (response.ok) {
      const content = await response.text();

      setShorthandContents({
        editor_content: content,
        content_id: item.path,
      });

      setShorthandMode('config');
      setOpenShorthand(true);
    }
  };

  const publishContainer = () => {
    history.push(`/publishcontainer/${workerNode}`, containerInfo);
  };

  const FileTile = ({ item }) => {
    const fileParts = new URL(`file://${item}`).pathname.split('/');
    const fileName = fileParts.pop();
    const filePath = fileParts.join('/').replace('/home/clouseau/', '~/');
    return (
      <>
        <span className={classes.fileName}>{fileName}</span>
        <p className={classes.filePath}>{filePath}</p>
      </>
    );
  };

  const shorthandDialogOnSave = () => {
    // trigger ShorthandEditor to tell the shorthand app to save
    setIsShorthandSaving(true);
    return false; // don't close FullScreenDialog
  };

  const saveEditor = async () => {
    await fetch(`/api/clouseau/container/${workerNode}/ops/save?path=${editor.file}`, {
      method: 'POST',
      body: editor.text
    });

    await fetch(`/api/clouseau/container/store/${containerInfo.id}/edits`, {
      method: 'PUT',
      body: JSON.stringify(editor)
    });

    // refetch the container after our request
    // potential TODO: return the container after the post request so we don't need to do this
    mutateContainer();
    return true; // should close FullScreenDialog
  };

  const displayModelDetails = () => {
    let parsedCoordinates = [];

    if (modelIsLoading) {
      return <div>Loading...</div>;
    }

    if (modelIsError) {
      return <div>There was an error, please refresh the page</div>;
    }

    if (model.geography?.coordinates.length) {
      parsedCoordinates = model.geography?.coordinates.map((coords, i, arr) => {
        // only display the separator if we aren't at the end of the list
        const separator = i !== arr.length - 1 ? ', ' : '';

        if (!coords[0].length || !coords[1].length) return null;

        return (
          <span key={coords}>
            {`[${coords[0].join()};${coords[1].join()}]`}
            {separator}
          </span>
        );
      });
    }

    // no need to spread the following out onto a million lines
    /* eslint-disable react/jsx-one-expression-per-line */
    return (
      <div>
        <Typography variant="subtitle2" className={classes.modelHeader}>
          Overview:
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model Name: {model.name}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model Website: {model.maintainer?.website}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model Family: {model.family_name}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model Description: {model.description}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model Start Date: {new Date(model.period?.gte).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model End Date: {new Date(model.period?.lte).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Stochastic Model: {model.stochastic}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Model ID: {model.id}
        </Typography>

        <Typography variant="subtitle2" className={classes.modelHeader}>Maintainer:</Typography>
        <Typography variant="body2" className={classes.subsection}>
          Name: {model.maintainer?.name}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Email: {model.maintainer?.email}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Organization: {model.maintainer?.organization}
        </Typography>

        <Typography variant="subtitle2" className={classes.modelHeader}>Geography:</Typography>
        <Typography variant="body2" className={classes.subsection}>
          Country: {model.geography?.country?.join(', ')}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Admin 1: {model.geography?.admin1?.join(', ')}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Admin 2: {model.geography?.admin2?.join(', ')}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Admin 3: {model.geography?.admin3?.join(', ')}
        </Typography>
        <Typography variant="body2" className={classes.subsection}>
          Coordinates: {parsedCoordinates}
        </Typography>
        <Typography variant="subtitle2" className={classes.modelHeader}>Categories:</Typography>
        <Typography variant="body2" className={classes.subsection}>
          {model.category.join(', ')}
        </Typography>
      </div>
    );
  };

  const displayConfigs = () => {
    if (configsLoading) {
      return <Typography variant="body2" align="center">Loading Configs...</Typography>;
    }

    if (configsError) {
      return (
        <Typography variant="body2" align="center">
          There was an error loading configuration files
        </Typography>
      );
    }

    if (!configs.length) {
      return <Typography variant="body2" align="center">No config files found</Typography>;
    }

    return configs.map((config) => (
      <Paper
        key={config.id}
        className={classes.paper}
        onClick={() => openConfigShorthand(config)}
      >
        <FileTile item={config.path} />
      </Paper>
    ));
  };

  const handleRunCommandClick = () => {
    setShorthandContents({
      editor_content: container?.run_command,
      content_id: container?.run_command,
    });
    setShorthandMode('directive');
    setOpenShorthand(true);
  };

  if (containerIsLoading) {
    return <div>Loading...</div>;
  }

  if (containerIsError) {
    return <div>There was an error, please refresh the page</div>;
  }

  return (
    <Container component="main" maxWidth="md" className={classes.root}>
      <div>
        <Typography
          className={classes.header}
          component="h3"
          variant="h4"
          align="center"
        >
          Model Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <div style={{ paddingBottom: '8px' }}>
              <Typography
                align="center"
                color="textSecondary"
                variant="h6"
                gutterBottom
              >
                Run Command
              </Typography>
              <RunCommandBox
                command={{ command: container?.run_command, cwd: container?.run_cwd }}
                summaryPage
                handleClick={handleRunCommandClick}
              />
            </div>

            <Typography
              align="center"
              color="textSecondary"
              variant="h6"
              gutterBottom
            >
              Config Files
            </Typography>
            <div className={classes.tilePanel}>
              {displayConfigs()}
            </div>
          </Grid>
          <Grid item xs={7}>
            <Typography
              align="center"
              color="textSecondary"
              variant="h6"
              gutterBottom
            >
              Model Details
            </Typography>
            <div className={classes.textareaAutosize}>
              <Button
                onClick={() => setOpenModelEdit(true)}
                className={classes.modelEditButton}
              >
                Edit
              </Button>
              {displayModelDetails()}
            </div>
          </Grid>
        </Grid>

        <div className={classes.publishButton}>
          <Fab
            variant="extended"
            color="primary"
            style={{ margin: '10px' }}
            onClick={(e) => { e.preventDefault(); publishContainer(); }}
          >
            Publish
          </Fab>
        </div>

      </div>

      <FullScreenDialog
        open={openEditor}
        setOpen={setOpenEditor}
        onSave={saveEditor}
        title={`Editing ${editor?.file}`}
      >
        <SimpleEditor editorContents={editor} setEditorContents={setEditor} />
      </FullScreenDialog>

      <FullScreenDialog
        open={openShorthand}
        setOpen={setOpenShorthand}
        onSave={shorthandDialogOnSave}
      >
        <ShorthandEditor
          directive={{
            command: container?.run_command,
            cwd: container?.run_cwd
          }}
          modelInfo={{ id: container?.model_id }}
          isSaving={isShorthandSaving}
          setIsSaving={setIsShorthandSaving}
          mode={shorthandMode}
          shorthandContents={shorthandContents}
          setIsShorthandOpen={setOpenShorthand}
        />
      </FullScreenDialog>
      {model && openModelEdit
        && <ModelSummaryEditor model={model} open={openModelEdit} setOpen={setOpenModelEdit} />}

    </Container>
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
