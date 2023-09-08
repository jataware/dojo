import React from 'react';
import { makeStyles } from 'tss-react/mui';
import HomeIcon from '@mui/icons-material/Home';
import GitHubIcon from '@mui/icons-material/GitHub';
import MailIcon from '@mui/icons-material/MailOutline';

import PngLogo from "./assets/DAG|PIPES.png";
import DojoLogo from "./assets/dojo_logo.svg";

import './layout.scss';

import { useSelector, useDispatch } from 'react-redux';

import ScenarioSelection from './ScenarioSelection';

import { setEdgeType } from './dagSlice';
import { graphEdgeTypes } from './constants';
import capitalize from 'lodash/capitalize';

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
  nav: {
    paddingRight: '1rem',
    ul: {
      marginBlockStart: '1rem',
      marginBlockEnd: '1rem',
      marginInlineStart: '0px',
      marginInlineEnd: '0px',
      paddingInlineStart: '1rem',
      display: 'flex',
    }
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

const Link = ({children}) => {
  const { css } = useStyles();
  return (
    <a
      href="/"
      className={css`
        color: white;
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #DDDDDD30;
        }
      `}
    >
      {children}
    </a>
  );
};

const edgeTypeOptions = graphEdgeTypes.map(t => ({value: t === 'bezier' ? 'default' : t, label: capitalize(t)}));

const EdgeTypeSelector = () => {
  const dispatch = useDispatch();

  const { edgeType } = useSelector((state) => state.dag);

  return (
    <select
      value={edgeType}
      onChange={(e) => {dispatch(setEdgeType(e.target.value)); }}
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

const GridLayout = ({children}) => {
  const { classes, css, cx } = useStyles();
  return (
    <div className="container">

      <header
        className={css`
            font-weight: bold;
            padding: 0.2rem 2rem;
            grid-area: header;
            display: flex;
            align-items: center;

            background-color: #292929;
            box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(0,0,0,.4);
        `}
      >

        <div
          className={cx([
            css`
               background-image: url(${DojoLogo});
               background-color: #26c6da;
               border-radius: 7px;
               cursor: pointer;
               background-position-x: -3px;
               background-position-y: -1px;
               background-size: cover;
             `,
            'logo'
          ])}
        >
        </div>

        <nav className={classes.nav}>
          <ul>
            <li><Link>
                  <HomeIcon />&nbsp;&nbsp;Home
                </Link>
            </li>
            &nbsp;
            &nbsp;
            &nbsp;
            <li><Link>
                  <GitHubIcon />&nbsp;&nbsp;Github
                </Link></li>
            &nbsp;
            &nbsp;
            &nbsp;
            <li><Link>
                  <MailIcon />&nbsp;&nbsp;Contact
                </Link></li>
          </ul>
        </nav>
      </header>

      <main className={classes.main} >
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
          >Settings</h3>

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
