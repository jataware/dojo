import React from 'react';
import { useStyles } from 'tss-react/mui';
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

  return (
    <footer style={{ background: 'white' }}>
      <div>
        {nodeCount} nodes. {unsavedChanges && (<span>Unsaved Changes.</span>)}
      </div>
    </footer>
  );
};

const GridLayout = ({children}) => {
  const { css, cx } = useStyles();
  return (
    <div className="container">

      <header>

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

        <nav>
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

      <main>
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
