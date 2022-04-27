import React, { useEffect } from 'react';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(25),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(25, 0, 0),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  model_data: {
    margin: theme.spacing(3, 0, 2),
  },
  pos: {
    marginTop: 5,
  },
  maincard: {
    background: '#7789ff36'
  },
}));

const LandingPage = () => {
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    document.title = 'Home - Dojo';
  }, []);

  const registerModel = () => {
    history.push('/model');
  };

  const viewModels = () => {
    history.push('/models');
  };

  // const dataUrl = process.env.ANNOTATE_UI_URL ? process.env.ANNOTATE_UI_URL : 'https://data.wm.dojo-modeling.com/';
  const dataUrl = 'https://data.wm.dojo-modeling.com/';

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <div className={classes.paper}>
        <img src="./assets/Dojo_Logo_profile.png" alt="Dojo Icon" width="80" height="100" />

        <Typography component="h3" variant="h4">
          Welcome to Dojo
        </Typography>

        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.model_data}
          spacing={5}
        >

          <Grid item xs={6}>

            <Card className={classes.maincard}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Register A Model
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Register an executable model.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  color="primary"
                  data-test="modelFormGoBtn"
                  onClick={registerModel}
                  size="small"
                  variant="contained"
                >
                  Go!
                </Button>
              </CardActions>
            </Card>

          </Grid>
          <Grid item xs={6}>
            <Card className={classes.maincard}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Register a Dataset
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Register a Dataset.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  href={dataUrl}
                >
                  Go!
                </Button>
              </CardActions>
            </Card>

          </Grid>

          <Grid item xs={6}>
            <Card className={classes.maincard}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  View Existing Models
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Revisit a previously registered model.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={viewModels}
                >
                  Go!
                </Button>
              </CardActions>
            </Card>

          </Grid>
          <Grid item xs={6}>
            <Card className={classes.maincard}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  View Existing Datasets
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  Revisit a previously registered dataset.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  href="/datasets"
                >
                  Go!
                </Button>
              </CardActions>
            </Card>

          </Grid>
        </Grid>
      </div>
    </Container>
  );
};

export default LandingPage;
