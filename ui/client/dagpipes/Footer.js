import React from 'react';

import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
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
        <Tooltip title="View Data Modeling documentation (opens new tab)">
          <Link
            href="https://www.dojo-modeling.com/data-modeling.html"
            target="_blank"
            rel="noopener"
          >
            Data Modeling
          </Link>
        </Tooltip>
      </Typography>
    </footer>
  );
};

export default Footer;
