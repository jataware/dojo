import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  loadingOverlay: {
    backgroundColor: 'rgb(224,224,224,0.8)',
    left: 0,
    height: '100%',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: '999',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(30),
    alignItems: 'center',
  },
  text: {
    // color: theme.palette.common.white,
    marginBottom: theme.spacing(5)
  },
}));

function LoadingOverlay({ text }) {
  const classes = useStyles();

  return (
    <div className={classes.loadingOverlay}>
      {text && (
        <Typography
          variant="h4"
          align="center"
          className={classes.text}
        >
          {text}
        </Typography>
      )}
      <CircularProgress />
    </div>
  );
}

export default LoadingOverlay;
