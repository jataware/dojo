import React from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const ModelerProcessing = () => (
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

export default ModelerProcessing;
