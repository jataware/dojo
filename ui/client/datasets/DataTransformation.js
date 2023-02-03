import React, { useState, useEffect } from 'react';

import axios from 'axios';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import ClipMap from './ClipMap';
import ClipTime from './ClipTime';
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
  classes, annotations, datasetInfo, stepTitle, handleNext, handleBack, useFilepath = false, rawFileName, ...props
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerName, setDrawerName] = useState(null);
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    if (!datasetInfo?.id) {
      return;
    }

    const fileArg = (useFilepath ? "filepath" : "filename");
    const previewUrl = `/api/dojo/indicators/${datasetInfo.id}/preview/raw${rawFileName ? `?${fileArg}=${rawFileName}` : ''}`;

    // const getAnnotations = async () => {
    //   // TODO verify and document this:
    //   // Model Output condition: We store STATE in memory (no backing indicator created)
    //   // So we need to ensure we return the data received from props, and not do a new fetch
    //   if (annotations?.metadata?.geotime_classify) {
    //     return {data: annotations};
    //   }
    //   else {
    //     // Load annotations from API, which also include other data unavailable if we don't call this
    //     return axios.get(`/api/dojo/indicators/${datasetInfo.id}/annotations`);
    //   }
    // };

    Promise
      .all([
        // getAnnotations(),
        axios.post(previewUrl)
      ])
      .then(([serverAnnotationData, preview]) => {
        const { data } = serverAnnotationData;
        const datasetCountries = new Set();
        data.forEach((item) => {
          if (item.country) {
            datasetCountries.add(item.country);
          }
        });
        setCountries(datasetCountries);
        console.log('here are the countries!!', datasetCountries)
      //   const inferred = metadata.geotime_classify;
      //   const stats = {histograms: metadata.histograms, statistics: metadata.column_statistics};

      //   const parsedColumns = prepareColumns(preview.data[0]);
      //   const { annotations: serverAnnotations } = serverAnnotationData.data;

      //   setRows(preview.data);
      //   setColumns(parsedColumns);
      //   setInferredData(inferred);
      //   setColumnStats(stats);

      //   if (serverAnnotations) {
      //     const formattedIn = formatAnnotationsIN(serverAnnotations);
      //     setInternalAnnotations(formattedIn.annotations);
      //     setMultiPartData(formattedIn.multiPartData);
      //   }
      })
      .catch((e) => {
        // setPromptMessage('Error loading annotation data.');
        // console.error('Error fetching geoclassify or raw preview:', e);
      })
      // .finally(() => { setLoading(false); });
  }, [datasetInfo, rawFileName, useFilepath]);

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
          <ClipMap countries={countries} />
        );
      case 'scaleTime':
        return (
          <ScaleTime />
        );
      case 'clipTime':
        return (
          <ClipTime />
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
