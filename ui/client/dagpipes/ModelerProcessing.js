import React, { useEffect } from 'react';

import axios from 'axios';

import { useDispatch, useSelector } from 'react-redux';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { setCompletedDatasetIds, nextModelerStep } from './dagSlice';

const mockDatasets = [
  '83de4099-ed1a-4a35-a204-4cb58bede279',
  '8987a98e-4128-4602-9f72-e3efa1b53668',
  '27d2e4ec-ba65-4fab-8bae-3837fb94ff77',
  '426040ca-b355-4994-8fa0-b83f649a2f9d',
  'd00db6c4-6c31-415f-8d83-20f9d5b8e233',
];

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
  const dispatch = useDispatch();

  useEffect(() => {
    const onSuccess = (resp) => {
      console.log('Successful!', resp);
      // TODO: determine what part of resp to set once we actually get this back
      dispatch(setCompletedDatasetIds(mockDatasets));
      dispatch(nextModelerStep());
    };

    console.log('this is the jobId', flowcastJobId);
    repeatFetch({ jobId: flowcastJobId, onSuccess });
    // TODO: remove this - just mocked while the job doesn't return anything
    // if (flowcastJobId) onSuccess('success!');
  }, [flowcastJobId, dispatch]);

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
