import React from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';
import { useLocation } from 'react-router-dom';

import { HorizontalLinearStepper } from './components/ModelFormStepper';
import usePageTitle from './components/uiComponents/usePageTitle';

const useStyles = makeStyles()((theme) => ({
  paper: {
    marginTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepper: {
    marginTop: theme.spacing(3),
  },
}));

export default function Model() {
  const { classes } = useStyles();
  usePageTitle({ title: 'Model Registration' });

  const query = new URLSearchParams(useLocation().search);
  const modelFamily = query.get('family');

  return (
    <>
      <Container component="main" maxWidth="md">
        <div className={classes.paper}>

          <Typography component="h3" variant="h4">
            Model Registration
          </Typography>

          <Container className={classes.stepper}>
            <HorizontalLinearStepper modelFamily={modelFamily} />
          </Container>
        </div>
      </Container>

    </>
  );
}
