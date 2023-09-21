import React from 'react';

import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import { useSelector } from 'react-redux';

const useStyles = makeStyles()((theme) => ({
  footer: {
    gridArea: 'footer',
    borderTop: `1px solid ${theme.palette.grey[400]}`,
    height: '38px',
    backgroundColor: theme.palette.grey[200],
    width: '100%',
  },
}));

const Footer = () => {
  const { nodeCount, unsavedChanges } = useSelector((state) => state.dag);
  const { classes } = useStyles();

  return (
    <footer className={classes.footer}>
      <Typography variant="subtitle2" sx={{ padding: 1 }}>
        {nodeCount} nodes. {unsavedChanges && (<span>Unsaved Changes.</span>)}
      </Typography>
    </footer>
  );
};

export default Footer;
