import React, { useEffect, useState } from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';
import { useLocation } from 'react-router-dom';

import { HorizontalLinearStepper } from './components/ModelFormStepper';
import ToggleRole from './components/ToggleRole';

const useStyles = makeStyles((theme) => ({
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
  const classes = useStyles();
  const [selectedRole, setSelectedRole] = useState(null);

  const query = new URLSearchParams(useLocation().search);
  const modelFamily = query.get('family');

  useEffect(() => {
    document.title = 'Model Registration - Dojo';
  }, []);

  return (
    <>
      <Container component="main" maxWidth="md">
        <div className={classes.paper}>

          <div style={{ display: 'flex' }}>
            <Typography component="h3" variant="h4">
              Model Registration
            </Typography>
            <ToggleRole updateRole={setSelectedRole} />
          </div>

          <Container className={classes.stepper}>
            <HorizontalLinearStepper modelFamily={modelFamily} currentRole={selectedRole} />
          </Container>
        </div>
      </Container>

    </>
  );
}
