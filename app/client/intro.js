import React, { useState } from 'react';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Typography from '@material-ui/core/Typography';

import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import LinearProgress from '@material-ui/core/LinearProgress';

import { useHistory } from 'react-router-dom';

import { Alert } from './alert';

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

      const containerid = await fetch('/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: imageName })
      }).then(async (response) => {
        const body = await response.text();
        if (response.ok) {
          return response;
        }
        throw new Error(`Failed to launch container ${body}`);
      }).catch((error) => { throw error; });

      console.log(`launched container: ${containerid}`);

      const execute = async (cmd) => {
        console.log(`exec ${cmd}`);
        setExecuting(cmd.join(' '));
        const response = await fetch('/api/exec/container', {
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

      await execute(['sudo', 'apt', 'update']);
      await execute(['sudo', 'apt', 'install', '-y', 'python3', 'python3-pip']);
      await execute(['git', 'clone', giturl]);

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

  return (
    <div className={classes.root}>
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
              <Select labelId="label" id="select" defaultValue="ubuntu-python">
                <MenuItem value="ubuntu-python">Ubuntu - Python</MenuItem>
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
