import React, { useCallback, useEffect, useState } from 'react';

import axios from 'axios';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { useModel } from './components/SWRHooks';

import BasicAlert from './components/BasicAlert';
import LoadingOverlay from './components/LoadingOverlay';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 200,
  },
  root: {
    flexGrow: 1,
    padding: [[theme.spacing(10), theme.spacing(2), theme.spacing(2)]],
  },
  gridContainer: {
    minHeight: '100vh',
    paddingTop: theme.spacing(14),
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  gridItem: {
    paddingBottom: '12px'
  },
  paperRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(1),
      width: theme.spacing(16),
      height: theme.spacing(16),
    },
  },
  loading: {
    // very specific here to match the height of the autocomplete and not cause a jump
    height: '43px',
  },
}));

const formatImageString = (s) => s.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_.-]/, '_');

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Provision = () => {
  const classes = useStyles();
  const history = useHistory();
  const query = useQuery();
  const relaunch = query.has('relaunch');
  const { modelId } = useParams();

  const { model, modelLoading, modelError } = useModel(modelId);

  const [imageInfo, setImageInfo] = useState({});

  const [alertVisible, setAlertVisible] = useState(false);

  const [alert, setAlert] = useState({
    severity: 'error',
    message: ''
  });

  const onImageInfoUpdate = useCallback((val, type) => {
    setImageInfo((prev) => ({ ...prev, ...{ [type]: val } }));
  }, []);

  useEffect(() => {
    if (model) {
      setImageInfo({
        model,
        imageName: formatImageString(model.name),
        dockerImage: '',
        gitUrl: model?.maintainer?.website ?? '',
      });
    }
  }, [model]);

  const launchTerm = async (e) => {
    e.preventDefault();

    // validate
    if (imageInfo.dockerImage === '') {
      setAlert({ severity: 'warning', message: 'Please select an Image' });
      setAlertVisible(true);
      return;
    }

    axios.post(`/api/clouseau/docker/provision/${modelId}`,
      {
        name: modelId,
        image: imageInfo.dockerImage,
        listeners: []
      }).then((response) => {
      console.info('Provision Response:', response);

      history.push(`/provisioning/${modelId}`, imageInfo);
    }).catch((error) => {
      if (error.response.status === 409) {
        // Lock already created, proceed to provisioning
        console.info('Lock exists :', error.response);
        history.push(`/provisioning/${modelId}`, imageInfo);
      } else {
        console.error('Error provisioning worker:', error);
        setAlert({ severity: 'error', message: 'Error provisioning worker' });
        setAlertVisible(true);
      }
    });
  };

  const [baseImageList, setBaseImageList] = React.useState([]);
  // eslint-disable-next-line no-unused-vars
  const [containers, setContainers] = React.useState([]);

  // if we come in with the relaunch parameter set, we want to continue where we left off
  // so load the model's existing image as the dockerImage that we'll pass along to launch
  // the terminal
  useEffect(() => {
    if (relaunch && model) {
      setImageInfo((prev) => (
        { ...prev, ...{ dockerImage: model?.image } }
      ));
    }
  }, [relaunch, model]);

  // find the image & display name that matches our model's image for the autocomplete
  const getRelaunchBaseImage = () => (
    baseImageList.find((image) => image.image === model?.image)
  );

  useEffect(() => {
    axios('/api/dojo/phantom/base_images').then((response) => setBaseImageList(response.data));
  }, []);

  if (modelLoading) {
    return <LoadingOverlay text="Loading..." />;
  }

  if (modelError) {
    return (
      <LoadingOverlay
        text="There was an error loading the model"
        error={modelError}
      />
    );
  }

  return (
    <Container
      className={classes.root}
      component="main"
    >
      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        className={classes.gridContainer}
      >
        <Typography variant="h5" id="tableTitle" component="div" style={{ marginBottom: '20px' }}>
          Set Up a Container
        </Typography>

        <Paper className={classes.paper} elevation={3} style={{ minWidth: '600px' }}>
          <Typography variant="h5" id="tableTitle" component="div">
            {model?.name}
          </Typography>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl} fullWidth>
              {baseImageList.length ? (
                <Autocomplete
                  options={baseImageList}
                  value={(relaunch && getRelaunchBaseImage()) || imageInfo?.model?.dockerImage}
                  disabled={relaunch}
                  getOptionLabel={(option) => option.display_name}
                  onChange={(e, value) => onImageInfoUpdate(value?.image, 'dockerImage')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        relaunch ? 'Your existing image has been preselected below'
                          : 'Select or search for a base image'
                      }
                    />
                  )}
                />
              ) : (
                <Typography variant="subtitle1" align="center" gutterBottom className={classes.loading}>
                  loading ...
                </Typography>
              )}
            </FormControl>

          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl}>
              <Button
                color="primary"
                data-test="modelContainerLaunchBtn"
                onClick={launchTerm}
                variant="contained"
              >
                Launch
              </Button>
            </FormControl>
          </Grid>
        </Paper>
      </Grid>

      <BasicAlert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />
    </Container>
  );
};

export default Provision;
