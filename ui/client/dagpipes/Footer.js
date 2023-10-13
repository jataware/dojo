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
  text: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const Footer = () => {
  const { nodeCount, unsavedChanges } = useSelector((state) => state.dag);
  const { classes } = useStyles();

  return (
    <footer className={classes.footer}>
      <Typography variant="subtitle2" className={classes.text}>
        <span>
          {nodeCount} node{nodeCount === 1 ? '' : 's'}. {unsavedChanges && (<span>Unsaved Changes.</span>)}
        </span>
        <span>
          Data Modeler
        </span>
      </Typography>
    </footer>
  );
};

export default Footer;