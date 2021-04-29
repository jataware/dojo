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
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';

import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { Alert } from './alert';

const clearHistory = () => {
  // HACK
  localStorage.setItem('historyItems', JSON.stringify([]));
};

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
  }
}));

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

const Intro = () => {
  const classes = useStyles();
  const history = useHistory();
  const [giturl, setGitUrl] = useState('https://github.com/jataware/dummy-model');
  const [imageName, setImageName] = useState('');
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [alert, setAlert] = React.useState({
    severity: 'error',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [executing, setExecuting] = React.useState('');
  const [imageType, setImageType] = React.useState('ubuntu');

  const launchTerm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/cors/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: giturl }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Invalid giturl ${giturl}`);
        }
      }).catch((error) => {
        throw error;
      });

      const containerid = await fetch('/api/docker/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: imageName })
      }).then(async (response) => {
        const body = await response.json();
        if (response.ok) {
          return body.id;
        }
        throw new Error(`Failed to launch container ${body}`);
      }).catch((error) => { throw error; });

      console.log(`launched container: ${containerid}`);

      clearHistory();

      const execute = async (cmd) => {
        console.log(`exec ${cmd}`);
        setExecuting(cmd.join(' '));
        const response = await fetch(`/api/docker/exec/${containerid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cmd }),
        });
        if (!response.ok) {
          throw new Error(`Failed to configure container - cmd: ${cmd}`);
        }
        return response;
      };

      const provision = [...getProvisioning(imageType), ['git', 'clone', giturl]];

      await provision.reduce(async (memo, cmd) => {
        await memo;
        await execute(cmd);
      }, undefined);

      setTimeout(() => {
        setLoading(false);
        history.push('/term');
      }, 5000);
    } catch (err) {
      setLoading(false);
      console.log(err);
      setAlert({ severity: 'error', message: err.message });
      setAlertVisible(true);
    }
  };

  const formatImageString = (s) => s.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_.-]/, '_');

  const [containers, setContainers] = React.useState([]);

  const refreshContainers = async () => {
    const resp = await fetch('/api/docker/containers');
    const cs = (await resp.json()).filter((c) => c.Image.includes('claudine'));
    setContainers(cs);
  };

  useEffect(async () => {
    await refreshContainers();
  }, []);

  const destroyContainer = async (id) => {
    await fetch(`api/docker/stop/${id}`, { method: 'DELETE' });
    clearHistory();
    await refreshContainers();
  };

  const handleDestroy = async (e) => {
    e.preventDefault();
    containers.reduce(async (memo, c) => {
      await memo;
      await destroyContainer(c.Id);
    }, undefined);
  };

  const ContainersCard = () => (
    <Card
      style={{
        position: 'absolute', top: 0, margin: '10px', maxWidth: 280
      }}
      hidden={containers.length === 0}
    >
      <CardActionArea>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px', color: 'yellow' }} />
            A container is already running would you like to connect or destroy it?
          </Typography>
          {containers.map((v) => (
            <div key={v.Id}>
              <span>{v.Id.substring(0, 8)}</span>
              {'  '}
              <span>{v.Image}</span>
            </div>
          ))}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" variant="contained" color="primary" onClick={() => history.push('/term')}>
          Reconnect
        </Button>
        <Button size="small" variant="contained" color="primary" onClick={handleDestroy}>
          Destroy
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <div className={classes.root}>
      <ContainersCard containers={containers} />
      <Grid
        container
        spacing={3}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: '100vh' }}
      >
        <Paper className={classes.paper} elevation={3} style={{ minWidth: '600px' }}>
          <Typography variant="h5" id="tableTitle" component="div" style={{ paddingLeft: '10px' }}>
            Clouseau
          </Typography>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl} fullWidth>
              <TextField
                label="Repo"
                placeholder="Placeholder"
                helperText="Enter Github checkout url"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                value={giturl}
                onChange={(e) => setGitUrl(e.target.value)}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl} fullWidth>
              <TextField
                label="Image Name"
                placeholder="Placeholder"
                helperText="Enter name of image to create (characters allowed [a-zA-Z0-9_.-])"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                value={imageName}
                onChange={(e) => setImageName(formatImageString(e.target.value))}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl} fullWidth>
              <InputLabel id="label">Base Image</InputLabel>
              <Select labelId="label" id="select" defaultValue="ubuntu" onChange={(_, { props: { value } }) => setImageType(value)}>
                <MenuItem value="ubuntu">Ubuntu</MenuItem>
                <MenuItem value="ubuntu-python">Ubuntu - Python3</MenuItem>
                <MenuItem value="ubuntu-r">Ubuntu - R</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} className={classes.gridItem}>
            <FormControl className={classes.formControl}>
              <Button variant="contained" color="primary" onClick={launchTerm} disabled={loading}>
                Launch
              </Button>
            </FormControl>

          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            {loading
             && (
             <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
               <LinearProgress />
               {executing}
             </div>
             )}
          </Grid>
        </Paper>
      </Grid>

      <Alert alert={alert} visible={alertVisible} setVisible={setAlertVisible} />
    </div>
  );
};

export default Intro;
