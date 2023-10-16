import React, { useEffect } from 'react';

import axios from 'axios';

import { useSelector } from 'react-redux';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// TODO: need to ensure it has some way to cancel job if the component unmounts
const repeatFetch = async ({ jobId, onSuccess }) => {
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
      shouldContinue = false;
    }

    if (shouldContinue) {
      // Wait for a specified time before the next request
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};

const ModelerProcessing = () => {
  const { flowcastJobId } = useSelector((state) => state.dag);

  const onSuccess = (resp) => {
    console.log('Successful!', resp);
  };

  useEffect(() => {
    console.log('this is the jobId', flowcastJobId)
    repeatFetch({ jobId: flowcastJobId, onSuccess });
  }, [flowcastJobId]);

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70%',
        flexDirection: 'column',
        gap: 2,
        color: 'grey.700'
      }}
    >
      <Typography variant="h4">Processing...</Typography>
      <CircularProgress size={38} color="inherit" />
    </Container>
  );
};

export default ModelerProcessing;
