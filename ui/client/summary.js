import React, { useEffect, useState } from 'react';

import axios from 'axios';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Link, useHistory, useLocation } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';
import DirectiveBox from './components/DirectiveBox';
import FileCardList from './components/FileCardList';
import FullScreenDialog from './components/FullScreenDialog';
import LoadingOverlay from './components/LoadingOverlay';
import { ModelSummaryEditor } from './components/ModelSummaryEditor';
import ShorthandEditor from './components/ShorthandEditor';
import SimpleEditor from './components/SimpleEditor';
import SummaryAccessories from './components/SummaryAccessories';

import {
  useConfigs, useContainer, useModel, useOutputFiles
} from './components/SWRHooks';

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
  headerContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr repeat(3, auto) 1fr',
    gridColumnGap: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    '& > :first-child': {
      placeSelf: 'start',
    },
  },
  detailsPanel: {
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(2),
    borderRadius: '4px',
    borderWidth: 0,
    width: '100%',
    '&:focus': {
      outlineColor: '#fff',
      outlineWidth: 0,
      boxShadow: '0 0 10px #0c0c0c',
    },
  },
  runCommandContainer: {
    paddingBottom: theme.spacing(1),
  },
  headerText: {
    // this matches up with the headers in FileCardList
    paddingTop: '10px',
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
  cardGridContainer: {
    '& > *': {
      height: '100%',
    },
  },
}));

const Page = ({ modelIdQueryParam, workerNode, edit }) => {
  // declare these up here so we can conditionally assign them below
  // eslint-disable-next-line one-var-declaration-per-line, one-var
  let containerInfo, container, containerIsLoading, containerIsError, mutateContainer;
  const [dialogOpen, setDialogOpen] = useState(!!modelIdQueryParam && !edit);
  const [disabledMode, setDisabledMode] = useState(!edit && !workerNode);
  const [loadingMode, setLoadingMode] = useState(false);

  // we're updating history & the url, rather than reloading the page when these props change
  // for the version bump, so we need to make sure we keep state up to date with the props
  useEffect(() => {
    setDialogOpen(!!modelIdQueryParam && !edit);
    setDisabledMode(!edit && !workerNode);
  }, [modelIdQueryParam, edit]);

  if (workerNode) {
    containerInfo = useContainerInfoContext();
    ({
      container, containerIsLoading, containerIsError, mutateContainer
    } = useContainer(containerInfo?.id));
  }

  // get the model id from the container if we have it, or from the query param
  const modelId = workerNode && container ? container?.model_id : modelIdQueryParam;

  const history = useHistory();

  const { model, modelIsLoading, modelIsError } = useModel(modelId);
  const { configs, configsLoading, configsError } = useConfigs(modelId);
  const { outputs, outputsLoading, outputsError } = useOutputFiles(modelId);

  const [openEditor, setOpenEditor] = useState(false);
  const [editor, setEditor] = useState(() => ({
    text: '', file: ''
  }));

  const [openShorthand, setOpenShorthand] = useState(false);
  const [isShorthandSaving, setIsShorthandSaving] = useState(false);
  const [shorthandContents, setShorthandContents] = useState({});
  const [shorthandMode, setShorthandMode] = useState();

  const [spacetagOpen, setSpacetagOpen] = useState(false);
  const [spacetagFile, setSpacetagFile] = useState();

  const [openModelEdit, setOpenModelEdit] = useState(false);

  // the two alerts on the page
  const [noDirectiveAlert, setNoDirectiveAlert] = useState(false);
  const [navigateAwayWarning, setNavigateAwayWarning] = useState(false);

  const classes = useStyles();
  const theme = useTheme();
  const mediumBreakpoint = useMediaQuery(theme.breakpoints.down('md'));

  const onUnload = (e) => {
    // preventDefault here triggers the confirm dialog
    e.preventDefault();
    // show the alert with our warning text, as we can't modify the confirm dialog text
    setNavigateAwayWarning(true);
  };

  // set up our confirm before navigating away warning
  useEffect(() => {
    // only do it if there is a container running
    // as this doesn't apply to version bump/metadata edits
    if (workerNode) {
      window.addEventListener('beforeunload', onUnload);
      return () => {
        window.removeEventListener('beforeunload', onUnload);
      };
    }
  }, [workerNode]);

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

  const publishContainer = (e) => {
    e.preventDefault();
    if (!container?.run_command) {
      setNoDirectiveAlert(true);
      return;
    }
    history.push(`/publishcontainer/${workerNode}`, containerInfo);
  };

  const FileTile = ({ item }) => {
    const fileParts = new URL(`file://${item}`).pathname.split('/');
    const fileName = fileParts.pop();
    const filePath = fileParts.join('/').replace('/home/clouseau/', '~/');
    return (
      <span>
        <Typography variant="subtitle1">{fileName}</Typography>
        <Typography variant="caption">{filePath}</Typography>
      </span>
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

  const handleRunCommandClick = () => {
    setShorthandContents({
      editor_content: container?.run_command,
      content_id: container?.run_command,
    });
    setShorthandMode('directive');
    setOpenShorthand(true);
  };

  const versionBumpModel = async () => {
    try {
      const response = await axios.get(`/api/dojo/models/version/${modelId}`);
      setLoadingMode(true);
      // pause for one second here to allow elastic search to catch up
      setTimeout(() => {
        // history.replace here because we want the back button to take the user back to /models
        // rather than navigating them back to the previous version
        history.replace(`/summary?model=${response.data}&edit`);
        setLoadingMode(false);
      }, 1000);
    } catch (error) {
      console.log('there was an error version bumping the model', error);
    }
  };

  if (containerIsLoading || modelIsLoading) {
    return <div>Loading...</div>;
  }

  if (containerIsError || modelIsError) {
    return <div>There was an error, please refresh the page</div>;
  }

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth={mediumBreakpoint ? 'md' : 'xl'}
    >
      {loadingMode && <LoadingOverlay text="Loading new model version..." />}
      <div>
        <div className={classes.headerContainer}>
          <Button
            component={workerNode ? Link : Button}
            to={workerNode ? `/term/${workerNode}/${model?.id}` : null}
            onClick={workerNode ? null : () => history.push('/intro?relaunch', model)}
            size="small"
            startIcon={<ArrowBackIcon />}
          >
            {workerNode ? 'Back to Terminal' : 'Launch Model in Terminal'}
          </Button>
          <Typography
            className={classes.header}
            component="h3"
            variant="h4"
            align="center"
          >
            Model Summary
          </Typography>
        </div>
        <Grid container spacing={2} className={classes.cardGridContainer}>
          <Grid item container xs={5} lg={6} spacing={2}>
            <Grid item xs={12} lg={6}>
              <div className={classes.runCommandContainer}>
                <Typography
                  align="center"
                  color="textSecondary"
                  variant="h6"
                  gutterBottom
                  className={classes.headerText}
                >
                  Model Execution Directive
                </Typography>
                { container?.run_command ? (
                  <DirectiveBox
                    command={{ command: container?.run_command, cwd: container?.run_cwd }}
                    summaryPage
                    handleClick={handleRunCommandClick}
                  />
                ) : (
                  <Typography variant="body2" align="center">
                    No execution directive found
                  </Typography>
                )}

              </div>
            </Grid>
            <Grid item xs={12} lg={6}>
              <FileCardList
                name="Config"
                files={configs}
                loading={configsLoading}
                error={configsError}
                clickHandler={(config) => openConfigShorthand(config)}
                icon={<EditIcon />}
                cardContent={(config) => <FileTile item={config.path} />}
                disableClick={disabledMode}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <FileCardList
                name="Output"
                files={outputs}
                loading={outputsLoading}
                error={outputsError}
                clickHandler={(output) => {
                  setSpacetagFile(output);
                  setSpacetagOpen(true);
                }}
                icon={<EditIcon />}
                disableClick={disabledMode}
                cardContent={(output) => (
                  <>
                    <Typography variant="subtitle1">{output.name}</Typography>
                    <Typography variant="caption">{output.path}</Typography>
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <SummaryAccessories modelId={modelId} disableClick={disabledMode} />
            </Grid>
          </Grid>
          <Grid item xs={7} lg={6}>
            <Typography
              align="center"
              color="textSecondary"
              variant="h6"
              gutterBottom
              className={classes.headerText}
            >
              Model Details
            </Typography>
            <div className={classes.detailsPanel}>
              <Button
                data-test="summaryDetailsEditButton"
                onClick={() => setOpenModelEdit(true)}
                className={classes.modelEditButton}
                disabled={disabledMode}
              >
                Edit
              </Button>
              {displayModelDetails()}
            </div>
          </Grid>
        </Grid>

        <div className={classes.publishButton}>
          {/* In disabledMode, we show the button to turn off disabledMode & version bump */}
          {disabledMode ? (
            <Fab
              variant="extended"
              color="primary"
              style={{ margin: '10px' }}
              onClick={() => {
                versionBumpModel();
              }}
            >
              Create New Model Version
            </Fab>
          ) : (
            <Fab
              variant="extended"
              color="primary"
              style={{ margin: '10px' }}
              onClick={publishContainer}
              disabled={!workerNode || disabledMode}
            >
              Publish
            </Fab>
          )}
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

      <FullScreenDialog
        open={spacetagOpen}
        setOpen={setSpacetagOpen}
        onSave={() => {}}
        showSave={false}
        title={`${spacetagFile?.name}`}
      >
        <iframe
          id="spacetag"
          title="spacetag"
          style={{ height: 'calc(100vh - 70px)', width: '100%' }}
          src={`/api/spacetag/overview/${spacetagFile?.id}?reedit=true`}
        />
      </FullScreenDialog>

      <Dialog
        open={dialogOpen}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return;
          }

          setDialogOpen(false);
        }}
      >
        <DialogTitle>
          Would you like to create a new model version?
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography gutterBottom>
              Any edits to the existing model&apos;s details, annotations, or output files require
              creating a new version.
            </Typography>
            <Typography gutterBottom>
              At the moment, editing existing models has limited functionality. Some buttons
              are disabled (Publish, Launch Model in Terminal, Edit Config), and some content is
              missing (Model Execution Directive). This feature is a work in progress and
              will include the functionality mentioned above very soon.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setDisabledMode(true);
            }}
          >
            No, view without editing
          </Button>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setDisabledMode(true);
              versionBumpModel();
            }}
          >
            Create new version
          </Button>
        </DialogActions>
      </Dialog>

      <BasicAlert
        alert={{
          message: 'Please add a model execution directive before publishing the model',
          severity: 'warning',
        }}
        visible={noDirectiveAlert}
        setVisible={setNoDirectiveAlert}
      />

      <BasicAlert
        alert={{
          message: `
            If you navigate away without publishing your model, any container changes will be lost
          `,
          severity: 'error',
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        visible={navigateAwayWarning}
        setVisible={setNavigateAwayWarning}
      />

      {model && openModelEdit
        && <ModelSummaryEditor model={model} open={openModelEdit} setOpen={setOpenModelEdit} />}
    </Container>
  );
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Summary = () => {
  const query = useQuery();
  const worker = query.get('worker');
  const model = query.get('model');
  const edit = query.has('edit');

  if (worker) {
    return (
      <ContainerInfoContextProvider workerNode={worker}>
        <HistoryContextProvider>
          <Page workerNode={worker} />
        </HistoryContextProvider>
      </ContainerInfoContextProvider>
    );
  }

  if (model) {
    return <Page modelIdQueryParam={model} edit={edit} />;
  }
};

export default Summary;
