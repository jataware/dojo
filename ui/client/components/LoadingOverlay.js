import React from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  loadingOverlay: {
    left: 0,
    height: '100%',
    position: 'absolute',
    // leave space for the navbar so it is still clickable
    top: '48px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(24),
    alignItems: 'center',
  },
  text: {
    // color: theme.palette.common.white,
    marginBottom: theme.spacing(5)
  },
}));

// pass in blank error prop to hide spinner
function LoadingOverlay({
  text, error, link
}) {
  const { classes } = useStyles();

  let errorTextHeader;
  let errorTextBody;

  if (error?.status) {
    errorTextHeader = `${error?.status}: ${error}`;
    errorTextBody = Object.keys(error?.info).reduce((string, current) => (
      `${string} ${current}: ${error.info[current]}`
    ), '');
  }

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
      {errorTextHeader && (
        <>
          <Typography
            variant="h6"
            align="center"
          >
            {errorTextHeader}
          </Typography>
          <Typography
            variant="h6"
            align="center"
          >
            {errorTextBody}
          </Typography>
        </>
      )}
      {!error && <CircularProgress />}
      {link && <Link variant="h6" href={link.href} underline="hover">{link.text}</Link>}
    </div>
  );
}

export default LoadingOverlay;
