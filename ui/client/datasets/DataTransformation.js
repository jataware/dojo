import React, { useState, useEffect } from 'react';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import Drawer from '../components/Drawer';
import { Navigation } from '.';
import ScaleTime from './ScaleTime';

export default withStyles(({ spacing }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],
  },
  header: {
    marginBottom: spacing(6),
  },
}))(({
  classes, stepTitle, handleNext, handleBack, ...props
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerName(null);
  };

  const handleDrawerOpen = (name) => {
    setDrawerOpen(true);
    setDrawerName(name);
  };

  const drawerInner = () => {
    switch (drawerName) {
      case 'regridMap':
        return (
          <Typography align="center" variant="h5">Regrid Map Data</Typography>
        );
      case 'clipMap':
        return (
          <Typography align="center" variant="h5">Clip Map Data</Typography>
        );
      case 'scaleTime':
        return (
          <ScaleTime />
        );
      case 'clipTime':
        return (
          <Typography align="center" variant="h5">Clip Temporal Data</Typography>
        );
      default:
        return (
          <Typography align="center" variant="h5">
            Sorry, there was an error. Please try refreshing the page
          </Typography>
        );
    }
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="sm"
    >
      <Typography
        className={classes.header}
        variant="h4"
        align="center"
      >
        {stepTitle}
      </Typography>

      <Typography variant="h5" onClick={() => handleDrawerOpen('regridMap')}>Regrid Map Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('clipMap')}>Clip Map Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('scaleTime')}>Scale Temporal Data</Typography>
      <Typography variant="h5" onClick={() => handleDrawerOpen('clipTime')}>Clip Temporal Data</Typography>

      <Navigation
        label="Next"
        handleNext={handleNext}
        handleBack={handleBack}
      />

      <Drawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anchorPosition="right"
        noConfirm
        PaperProps={{ variant: 'outlined' }}
      >
        {drawerInner()}
      </Drawer>
    </Container>
  );
});
