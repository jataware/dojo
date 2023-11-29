import React, { useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, useTheme } from '@mui/material/styles';

import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from './ThemeContextProvider';

import Sidebar from './Sidebar';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  backgroundColor: '#06B8EF',
  backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

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

const NavBar = ({ children }) => {
  const { classes } = useStyles();
  // TODO: hide navbar on second page of datamodeling
  const { showNavBar } = useContext(ThemeContext);
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (!showNavBar) setOpen(false);
    if (showNavBar) setOpen(true);
  }, [showNavBar]);

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    if (open) setOpen(false);
  };

  return (
    <>
      <div style={{ display: 'flex' }}>
        <AppBar
          open={open}
          position="fixed"
          elevation={0}
          classes={{ root: classes.appBarRoot }}
          sx={{ zIndex: theme.zIndex.drawer + 1, display: showNavBar ? 'flex' : 'none' }}
        >
          <Toolbar variant="dense" disableGutters className={classes.toolbar}>
            <Collapse
              in={!open}
              orientation="horizontal"
              timeout={theme.transitions.duration.enteringScreen}
            >
              <Tooltip arrow title="Open navigation panel">
                <IconButton
                  onClick={handleToggleDrawer}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </Collapse>
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
            <span className={classes.spacer} />
            <Tooltip title="View Dojo Docs (opens new tab)" arrow>
              <IconButton
                href="https://www.dojo-modeling.com"
                target="_blank"
                rel="noopener"
                sx={{ color: 'white' }}
              >
                <MenuBookIcon />
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
        <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
        <Main open={open}>
          {/*TODO: remove 56px padding from all containers/top level page components*/}
          <Toolbar variant="dense" sx={{ display: showNavBar ? 'flex' : 'none' }} />
          {children}
        </Main>
      </div>
    </>
  );
};

export default NavBar;
