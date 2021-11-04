import React, { useEffect, useState } from 'react';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';

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
}));

// todo delete
// eslint-disable-next-line no-unused-vars
const getProvisioning = (imageType) => {
  switch (imageType) {
    case 'ubuntu':
      return [['sudo', 'apt-get', 'update']];
    case 'ubuntu-python':
      return [
        ['sudo', 'apt-get', 'update'],
        ['sudo', 'apt-get', 'install', '-y', 'python3', 'python3-pip']
      ];
    case 'ubuntu-r':
      return [
        ['sudo', 'apt-get', 'update'],
        ['sudo', 'apt-get', 'install', '-y', '--no-install-recommends', 'software-properties-common', 'dirmngr'],
        ['sudo', 'apt-key', 'adv', '--keyserver', 'keyserver.ubuntu.com', '--recv-keys', 'E298A3A825C0D65DFD57CBB651716619E084DAB9'],
        ['sudo', 'add-apt-repository', 'deb https://cloud.r-project.org/bin/linux/ubuntu focal-cran40/'],
        ['sudo', 'apt-get', 'install', '-y', '--no-install-recommends', 'r-base'],
      ];
    default:
      break;
  }
  return [];
};

const formatImageString = (s) => s.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_.-]/, '_');

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Intro = ({ location }) => {
  const modelInfo = location?.state;
  const classes = useStyles();
  const history = useHistory();
  const query = useQuery();
  const relaunch = query.has('relaunch');
  const [imageInfo, setImageInfo] = useState({
    modelInfo,
    imageName: formatImageString(modelInfo.name),
    dockerImage: '',
    size: 't2-nano',
    gitUrl: modelInfo.maintainer?.website ?? '',
    worker: '',
  });
  const [alertVisible, setAlertVisible] = useState(false);

  const [alert, setAlert] = useState({
    severity: 'error',
    message: ''
  });

  const onImageInfoUpdate = (val, type) => {
    // const val = e.target?.value ?? '';
    setImageInfo((prev) => ({ ...prev, ...{ [type]: val } }));
  };

  const launchTerm = async (e) => {
    e.preventDefault();

    // validate
    if (imageInfo.dockerImage === '') {
      setAlert({ severity: 'error', message: 'Please select an Image' });
      setAlertVisible(true);
      return;
    }

    if (imageInfo.worker === '') {
      setAlert({ severity: 'error', message: 'Please select a worker' });
      setAlertVisible(true);
      return;
    }
    history.push('/loadingterm', imageInfo);
  };

  const fetchTimeout = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('fetch timed out'));
    }, 5000);
  });

  const [baseImageList, setBaseImageList] = React.useState([]);
  // eslint-disable-next-line no-unused-vars
  const [containers, setContainers] = React.useState([]);
  const [workerNodes, setWorkerNodes] = React.useState([]);
  const [workersIsLoaded, setWorkersIsLoaded] = React.useState(false);

  const refreshNodeInfo = async () => {
    const resp = await fetch('/api/clouseau/docker/nodes');
    const nodes = await resp.json();

    const nodeContainers = await Promise.all(nodes.map(async (n, i) => {
      try {
        const r = await Promise.race([fetch(`/api/clouseau/docker/${n.i}/containers`),
          fetchTimeout()]);

        if (!r.ok) {
          return { ...n, i, status: 'down' };
        }

        return {
          ...n,
          i,
          status: 'up',
          containers: await r.json()
        };
      } catch (e) {
        return { ...n, i, status: 'timeout' };
      }
    }));

    setWorkerNodes(nodeContainers);
    console.debug(nodeContainers);

    const cs = nodeContainers.reduce((acc, n) => {
      n.containers?.forEach((c) => acc.push({ node: n, container: c }));
      return acc;
    }, []);

    setContainers(cs);
    setWorkersIsLoaded(true);
  };

  useEffect(() => {
    refreshNodeInfo();
    fetch('/api/dojo/phantom/base_images').then(async (r) => setBaseImageList(await r.json()));
  }, []);

  const displayWorkerCard = (worker) => {
    let workerBusy;
    if (process.env.NODE_ENV === 'development') {
      // if we are on dev, we run all our containers (dojo, shorthand, etc) on the same worker
      workerBusy = worker.clients > 0;
    } else {
      // but everywhere else, any containers on a worker means it is busy
      workerBusy = worker.clients > 0 || worker.containers?.length;
    }

    let cardBackgroundColor = 'unset';
    let headerColor = '#00f000';
    let status = 'Available';
    let disabled = null;

    // some repetition here, but it's more readable than many ternaries
    if (worker.status !== 'up') {
      cardBackgroundColor = '#ff0000';
      status = 'Down';
      disabled = true;
      headerColor = '#f00000';
    }

    if (workerBusy) {
      cardBackgroundColor = '#ffcccc';
      status = 'Busy';
      disabled = true;
      headerColor = '#f00000';
    }

    return (
      <Grid item key={worker.i} xs={4}>
        <Card style={{ backgroundColor: cardBackgroundColor }}>
          <div style={{ backgroundColor: headerColor, height: '10px' }} />
          <CardActionArea
            onClick={() => onImageInfoUpdate(worker.i, 'worker')}
            data-test="modelWorkerCardBtn"
            disabled={disabled}
            style={{ backgroundColor: (worker.i === imageInfo.worker) ? '#e8fee4' : 'unset' }}
          >
            <CardContent>
              <span style={{ fontWeight: 'bold' }}>
                Worker-
                {worker.i}
              </span>
              <span>
                {' - '}
                {status}
              </span>
              <br />
              <span style={{ fontSize: 'smaller' }}>
                Connections:
                {worker.clients}
              </span>
              <br />
              <span style={{ fontSize: 'smaller' }}>
                Containers:
                {worker.containers?.length ?? 0}
              </span>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  return (
    <Container
      className={classes.root}
      component="main"
    >
      {relaunch && (
        <Alert severity="info">
          To relaunch a model container, please select
          your previously published base image from the list below
        </Alert>
      )}
      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        className={classes.gridContainer}
      >
        <Typography variant="h5" id="tableTitle" component="div" style={{ marginBottom: '20px' }}>
          Setup a Container
        </Typography>

        <Paper className={classes.paper} elevation={3} style={{ minWidth: '600px' }}>
          <Typography variant="h5" id="tableTitle" component="div">
            {modelInfo.name}
          </Typography>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel id="label">Select a Base Image</InputLabel>
              {baseImageList ? (
                <Select
                  labelId="label"
                  data-test="modelBaseImageSelect"
                  id="select"
                  defaultValue={imageInfo.dockerImage}
                  value={imageInfo.dockerImage}
                  onChange={(e) => onImageInfoUpdate(e.target.value, 'dockerImage')}
                >
                  { baseImageList.map((img) => (
                    <MenuItem key={img.image} value={img.image}>{img.display_name}</MenuItem>
                  ))}
                </Select>
              ) : <span> loading ... </span>}
            </FormControl>

          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <div>Select a Worker</div>
            <Grid container spacing={1}>
              { workersIsLoaded ? workerNodes.map((worker) => (
                displayWorkerCard(worker)
              )) : (
                <Grid item xs={6}>
                  Loading Workers...
                  <div style={{ height: '20px' }}>
                    <LinearProgress color="primary" />
                  </div>
                </Grid>
              )}
            </Grid>
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

export default Intro;
