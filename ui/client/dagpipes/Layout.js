import React from 'react';

import Typography from '@mui/material/Typography';
import { makeStyles } from 'tss-react/mui';

import { useSelector } from 'react-redux';

import './layout.scss';

const useStyles = makeStyles()((theme) => ({
  // TODO: not currently used anywhere, perhaps was intended to be global
  ul: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
    paddingInlineStart: 0,
  },
  footer: {
    gridArea: 'footer',
    borderTop: `1px solid ${theme.palette.grey[400]}`,
    height: '38px',
    backgroundColor: theme.palette.grey[200],
  },
}));

const Footer = () => {
  const { nodeCount, unsavedChanges } = useSelector((state) => state.dag);
  const { classes } = useStyles();

  return (
    <footer className={classes.footer}>
      <Typography variant="subtitle2" sx={{ p: 1 }}>
        {nodeCount} nodes. {unsavedChanges && (<span>Unsaved Changes.</span>)}
      </Typography>
    </footer>
  );
};

const GridLayout = ({ children }) => {
  const { classes } = useStyles();
  return (
    <div className="container">
        {children}
      <Footer />

    </div>
  );
};

export default GridLayout;
