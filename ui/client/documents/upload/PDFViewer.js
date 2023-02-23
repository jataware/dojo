import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

/**
 *
 **/
export default withStyles((theme) => ({
  root: {
    padding: "1rem",
    height: "100%"
  }
}))(({ classes, file }) => {

  return (
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
        width="100%" />

    </Paper>
  );
});
