import React, { useContext } from 'react';

import { Link } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import GitHubIcon from '@mui/icons-material/GitHub';
// TODO: maybe use this instead of Library icon for docs link?
// import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from './ThemeContextProvider';

const useStyles = makeStyles()((theme) => ({
  appBarRoot: {
    backgroundColor: '#06B8EF',
    backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
  },
  toolbar: {
    padding: `0 ${theme.spacing(5)}`,
    gap: theme.spacing(3),
  },
  dojoIcon: {
    height: '40px',
    width: '40px',
    marginRight: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
}));

const NavBar = () => {
  const { classes } = useStyles();
  const { showNavBar, fixedNavBar } = useContext(ThemeContext);

  if (!showNavBar) {
    return null;
  }

  return (
    <AppBar position={fixedNavBar ? 'fixed' : 'static'} elevation={0} classes={{ root: classes.appBarRoot }}>
      <Toolbar variant="dense" disableGutters className={classes.toolbar}>
        <Tooltip title="Dojo home" arrow>
          <IconButton
            component={Link}
            to="/"
            size="small"
          >
            <img
              src="/assets/Dojo_Logo_black.svg"
              alt="Dojo Logo"
              className={classes.dojoIcon}
            />
          </IconButton>
        </Tooltip>
        <Button
          component={Link}
          to="/models"
          color="grey"
        >
          Models
        </Button>
        <Button
          component={Link}
          to="/datasets"
          color="grey"
        >
          Datasets
        </Button>
        <Button
          component={Link}
          to="/runs"
          color="grey"
        >
          Model Runs
        </Button>
        <Button
          component={Link}
          to="/documents"
          color="grey"
        >
          Documents
        </Button>
        <Button
          component={Link}
          to="/data-modeling"
          color="grey"
        >
          Data Modeling
        </Button>
        <Button
          component={Link}
          to="/ai-assistant"
          color="grey"
        >
          AI Assistant
        </Button>
        <span className={classes.spacer} />
        <Tooltip title="View Dojo Docs (opens new tab)" arrow>
          <IconButton
            href="https://www.dojo-modeling.com"
            target="_blank"
            rel="noopener"
            sx={{ color: 'white' }}
          >
            <LibraryBooksIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Dojo on Github (opens new tab)" arrow>
          <IconButton
            href="https://github.com/jataware/dojo"
            target="_blank"
            rel="noopener"
            sx={{ color: 'white' }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
