import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 *
 **/
export default ({ file }) => (
  <Paper
    elevation={0}
    sx={{ padding: '1rem', height: '100%' }}
  >
    <Typography
      variant="h6"
      gutterBottom
    >
      {file.name}
    </Typography>

    {file.type === 'application/pdf' ? (
      <embed
        src={file.blobUrl}
        type="application/pdf"
        height="95%"
        width="100%"
      />
    ) : (
      <Typography variant="body2" color="textSecondary">
        Cannot preview non-PDF files.
      </Typography>
    )}

  </Paper>
);
