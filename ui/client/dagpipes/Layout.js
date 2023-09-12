import React from 'react';

import { makeStyles } from 'tss-react/mui';

import { useSelector, useDispatch } from 'react-redux';

import capitalize from 'lodash/capitalize';

import './layout.scss';

import { setEdgeType } from './dagSlice';
import { graphEdgeTypes } from './constants';

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
  aside: {
    gridArea: 'aside',
    marginRight: '0.5rem',
    background: '#fff',
    borderRadius: '6px',
    color: 'rgba(0,0,0,.87)',
    border: '1px solid #e5e5e5ad',
  },
  footer: {
    gridArea: 'footer',
    // border: 1px dashed green;
    padding: '1rem',
  },
}));

const edgeTypeOptions = graphEdgeTypes.map((t) => ({ value: t === 'bezier' ? 'default' : t, label: capitalize(t) }));

const EdgeTypeSelector = () => {
  const dispatch = useDispatch();

  const { edgeType } = useSelector((state) => state.dag);

  return (
    <select
      value={edgeType}
      onChange={(e) => { dispatch(setEdgeType(e.target.value)); }}
    >
      {edgeTypeOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

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
  const { classes, css } = useStyles();
  return (
    <div className="container">
      <main className={classes.main}>
        {children}
      </main>

      <aside className={css`background: white; padding-bottom: 1.5rem;`}>
        <h3 className={css`
             background: linear-gradient(60deg,#26c6da,#00acc1);
             padding: 1.33rem 0;
             border-top-left-radius: 5px;
             border-top-right-radius: 5px;
             margin-top: -1px;
             width: 100%;
             color: white;`}
        >Settings
        </h3>

        {/* <h4 className={css`color: gray;`}> */}
        {/*   Scenarios */}
        {/* </h4> */}

        {/* <div className={css`display:flex; flex-direction: column; align-items: center;`}> */}
        {/*   <ScenarioSelection /> */}
        {/* </div> */}

        <h4 className={css`color: gray;`}>
          Edge Type
        </h4>
        <EdgeTypeSelector />
      </aside>

      <Footer />

    </div>
  );
};

export default GridLayout;
