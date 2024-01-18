import React, { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { setCompletedDatasetIds, nextModelerStep } from './dagSlice';
import { ThemeContext } from '../components/ThemeContextProvider';

// TODO: need to ensure it has some way to cancel job if the component unmounts
const repeatFetch = async ({ jobId, onSuccess, onFailure }) => {
  let shouldContinue = true;

  if (!jobId) return;

  while (shouldContinue) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.post(`/api/dojo/job/fetch/${jobId}`);

      if (response.status === 200 && response.data) {
        onSuccess(response.data);
        shouldContinue = false;
      }
    } catch (error) {
      console.log(`There was an error fetching job ${jobId}: ${error}`);
      onFailure(error);
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Wait for a specified time before the next request
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

const ErrorCard = () => (
  <Card>
    <CardContent>
      <Typography variant="h6">There was a problem processing your graph</Typography>
    </CardContent>
    <CardActions>
      <Button>Go Back</Button>
    </CardActions>
  </Card>
);

const ModelerProcessing = () => {
  const { flowcastJobId } = useSelector((state) => state.dag);
  const dispatch = useDispatch();
  const [showError, setShowError] = useState(false);

  const { setShowSideBar } = useContext(ThemeContext);

  useEffect(() => {
    // hide the Sidebar when the component mounts
    setShowSideBar(false);
    // when the component unmounts, toggle the Sidebar back
    return () => setShowSideBar(true);
  }, [setShowSideBar]);

  useEffect(() => {
    const onSuccess = (resp) => {
      console.log('Successful!', resp);
      if (resp.hasOwnProperty('error')) {
        setShowError(true);
      } else if (resp.results) {
        const derivedDatasets = resp.results.map((dataset) => dataset.id);
        dispatch(setCompletedDatasetIds(derivedDatasets));
        dispatch(nextModelerStep());
      }
    };

    const onFailure = () => {
      setShowError(true);
    };

    console.log('this is the jobId', flowcastJobId);
    repeatFetch({ jobId: flowcastJobId, onSuccess, onFailure });
  }, [flowcastJobId, dispatch]);

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: 2,
        color: 'grey.700',
        marginTop: 18,
      }}
    >
      {showError ? (
        <ErrorCard />
      ) : (
        <>
          <Typography variant="h4">Processing...</Typography>
          <CircularProgress size={38} color="inherit" />
        </>
      )}
    </Container>
  );
};

export default ModelerProcessing;
