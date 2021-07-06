import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 200,
  },
  root: {
    flexGrow: 1,
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

const Intro = ({ location }) => {
  const modelInfo = location?.state;
  const classes = useStyles();
  const history = useHistory();
  const [imageInfo, setImageInfo] = useState({
    modelInfo,
    imageName: formatImageString(modelInfo.name),
    dockerImage: 'jataware/clouseau:claudine-latest',
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
  }, []);

  const destroyContainer = async (node, id) => {
    await fetch(`/api/clouseau/docker/${node}/stop/${id}`, { method: 'DELETE' });
    await refreshNodeInfo();
  };

  const handleDestroy = async (node) => {
    await destroyContainer(node.node.i, node.container.Id);
  };

  // eslint-disable-next-line no-unused-vars
  const ContainerCard = ({ node }) => {
    console.debug(node);
    return (
      <Card
        style={{
          // position: 'absolute', top: 0,
          margin: '10px', maxWidth: 280
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography variant="body2" component="p">
              <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px' }} />
              <span style={{ fontWeight: 'bold' }}>
                Worker-
                {node.node.i}
              </span>
              has a container running would you like to connect or destroy it?
            </Typography>
            <div style={{ marginTop: '5px' }}>
              Active Clients:
              {' '}
              <span style={{ fontWeight: 'bold' }}>
                {node.node.clients}
                {' '}
              </span>
            </div>
            <div>
              Image:
              {' '}
              {node.container.Id.substring(0, 8)}
            </div>
            <div>
              Name:
              {' '}
              {node.container.Names[0]}
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>{node.container.Status}</span>
            </div>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" variant="contained" color="primary" disabled>
            Reconnect
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              handleDestroy(node);
            }}
          >
            Destroy
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <div className={classes.root}>
      <div style={{ position: 'absolute', top: 0 }}>
        {/* containers.map((v) => (<ContainerCard node={v} />)) */}
      </div>

      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
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

              <Select labelId="label" id="select" defaultValue={imageInfo.dockerImage} value={imageInfo.dockerImage} onChange={(e) => onImageInfoUpdate(e.target.value, 'dockerImage')}>
                <MenuItem value="jataware/clouseau:claudine-latest">Ubuntu</MenuItem>
                <MenuItem value="jataware/clouseau:claudine_ki_models">Kimetrica</MenuItem>
                <MenuItem value="jataware/clouseau:pythia_22jun_1-latest">Pythia</MenuItem>
              </Select>
            </FormControl>

          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <div>Select a Worker</div>
            <Grid container spacing={1}>
              { workersIsLoaded ? workerNodes.map((n) => (
                <Grid item key={n.i} xs={4}>
                  <Card style={{ backgroundColor: (n.status !== 'up') ? '#ff0000' : (n.clients > 0) ? '#ffcccc' : 'unset' }}>
                    <div style={{ backgroundColor: (n.status !== 'up' || n.clients > 0) ? '#f00000' : '#00f000', height: '10px' }} />
                    <CardActionArea onClick={() => onImageInfoUpdate(n.i, 'worker')} disabled={(n.status !== 'up' || n.clients > 0)} style={{ backgroundColor: (n.i === imageInfo.worker) ? '#e8fee4' : 'unset' }}>
                      <CardContent>
                        <span style={{ fontWeight: 'bold' }}>
                          Worker-
                          {n.i}
                        </span>
                        <span>
                          {' - '}
                          {(n.status !== 'up') ? 'Down' : (n.clients > 0) ? 'Busy' : 'Available'}
                        </span>
                        <br />
                        <span style={{ fontSize: 'smaller' }}>
                          Connections:
                          {n.clients}
                        </span>
                        <br />
                        <span style={{ fontSize: 'smaller' }}>
                          Containers:
                          {n.containers?.length ?? 0}
                        </span>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
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
              <Button variant="contained" color="primary" onClick={launchTerm}>
                Launch
              </Button>
            </FormControl>
          </Grid>
        </Paper>
      </Grid>

      <BasicAlert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />
    </div>
  );
};

export default Intro;
