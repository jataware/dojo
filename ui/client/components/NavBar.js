import React, { useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, useTheme } from '@mui/material/styles';

import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from './ThemeContextProvider';

import { BlackTooltip } from './uiComponents/BlackTooltip';
import { ContrastIconButton } from './uiComponents/ContrastButton';
import Sidebar from './Sidebar';
// import DojoIcon from './uiComponents/DojoIcon';

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
  const { showNavBar, showSideBar } = useContext(ThemeContext);
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // close the sidebar when we hide the navbar or just close the sidebar
    if (!showNavBar || !showSideBar) setOpen(false);
    // open the sidebar when nothing is closing it
    if (showNavBar && showSideBar) setOpen(true);
  }, [showNavBar, showSideBar]);

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
              <BlackTooltip title="Open navigation panel">
                <ContrastIconButton
                  onClick={handleToggleDrawer}
                >
                  <MenuIcon />
                </ContrastIconButton>
              </BlackTooltip>
            </Collapse>
            <BlackTooltip title="Dojo home">
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
                {/*<DojoIcon className={classes.dojoIcon} color="primary"/>*/}
              </IconButton>
            </BlackTooltip>
            <span className={classes.spacer} />
            <BlackTooltip title="View Dojo Docs (opens new tab)">
              <ContrastIconButton
                href="https://www.dojo-modeling.com"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                }}
              >
                <MenuBookIcon />
              </ContrastIconButton>
            </BlackTooltip>
            <BlackTooltip title="View Dojo on Github (opens new tab)">
              <ContrastIconButton
                href="https://github.com/jataware/dojo"
                target="_blank"
                rel="noopener"
                sx={{
                  color: 'white',
                }}
              >
                <GitHubIcon />
              </ContrastIconButton>
            </BlackTooltip>
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
