import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 *
 **/
export default withStyles(() => ({
  root: {
    padding: '1rem',
    height: '100%'
  }
}))(({ classes, file }) => (
  <Paper
    elevation={0}
    className={
        clsx({
          [classes.root]: true
        })
      }
  >
    <Typography
      variant="h6"
      gutterBottom
    >
      {file.name}
    </Typography>

    <embed
      src={file.blobUrl}
      type="application/pdf"
      height="95%"
      width="100%"
    />

  </Paper>
));
