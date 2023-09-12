import React from 'react';

import { makeStyles } from 'tss-react/mui';

import { useSelector } from 'react-redux';

import './layout.scss';

const useStyles = makeStyles()(() => ({
  main: {
    gridArea: 'main',
    position: 'relative',
    background: '#fff',
    borderRadius: '6px',
    color: 'rgba(0,0,0,.87)',
    border: '1px solid #e5e5e5ad',
    marginLeft: '0.5rem',
  },
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
    // border: 1px dashed green;
    padding: '1rem',
  },
}));

const Footer = () => {
  const { nodeCount, unsavedChanges } = useSelector((state) => state.dag);
  const { classes } = useStyles();

  return (
    <footer className={classes.footer} style={{ background: 'white' }}>
      <div>
        {nodeCount} nodes. {unsavedChanges && (<span>Unsaved Changes.</span>)}
      </div>
    </footer>
  );
};

const GridLayout = ({ children }) => {
  const { classes } = useStyles();
  return (
    <div className="container">
      <main className={classes.main}>
        {children}
      </main>
      <Footer />

    </div>
  );
};

export default GridLayout;
