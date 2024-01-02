import React, { useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Collapse from '@mui/material/Collapse';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import SvgIcon from '@mui/material/SvgIcon';
import { styled, useTheme } from '@mui/material/styles';

import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from './ThemeContextProvider';

import { ThemedTooltip } from './uiComponents/ThemedTooltip';
import { ContrastIconButton } from './uiComponents/ContrastButton';
import Sidebar, { drawerWidth } from './Sidebar';
import DojoIcon from './uiComponents/DojoIcon';
import BrandSwap from './uiComponents/BrandSwap';
import { ReactComponent as IfpriLogo } from '../assets/ifpri-logo.svg';

export const pageSlideAnimation = (theme, target) => ({
  transition: theme.transitions.create(target, {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
});

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    ...pageSlideAnimation(theme, 'margin'),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  backgroundColor: theme.custom.nav.color,
  backgroundImage: theme.custom.nav.image,
  ...pageSlideAnimation(theme, ['margin', 'width']),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
  }),
}));

const useStyles = makeStyles()((theme) => ({
  appBarRoot: {
    backgroundColor: theme.custom.nav.color,
    backgroundImage: theme.custom.nav.image,
  },
  toolbar: {
    padding: `0 ${theme.spacing(5)}`,
    gap: theme.spacing(3),
  },
  spacer: {
    flexGrow: 1,
  },
}));

const NavBar = ({ children }) => {
  const { classes } = useStyles();
  const { showNavBar, showSideBar, setShowSideBar } = useContext(ThemeContext);
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // close the sidebar when we hide the navbar or just close the sidebar
    if (!showNavBar || !showSideBar) setOpen(false);
    // open the sidebar when nothing is closing it
    if (showNavBar && showSideBar) setOpen(true);
  }, [showNavBar, showSideBar]);

  const handleToggleDrawer = () => {
    // save the state so we don't end up with a race condition issue
    const currentToggledVal = !open;
    setOpen(currentToggledVal);
    setShowSideBar(currentToggledVal);
  };

  const handleDrawerClose = () => {
    if (open) {
      setOpen(false);
      setShowSideBar(false);
    }
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
              <ThemedTooltip disableInteractive title="Open navigation panel">
                <ContrastIconButton
                  onClick={handleToggleDrawer}
                  sx={{ color: 'white' }}
                >
                  <MenuIcon />
                </ContrastIconButton>
              </ThemedTooltip>
            </Collapse>
            <ThemedTooltip disableInteractive title="Dojo home">
              <ContrastIconButton
                component={Link}
                to="/"
                sx={{ color: 'white' }}
              >
                <BrandSwap
                  dojoComponent={(
                    <DojoIcon color="inherit" sx={{ height: '30px', width: '30px' }} />
                  )}
                  ifpriComponent={(
                    <SvgIcon
                      component={IfpriLogo}
                      inheritViewBox
                      sx={{ height: '30px', width: '30px' }}
                    />
                  )}
                />
              </ContrastIconButton>
            </ThemedTooltip>
            <span className={classes.spacer} />
            <ThemedTooltip disableInteractive title="View Dojo Docs (opens new tab)">
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
            </ThemedTooltip>
            <ThemedTooltip disableInteractive title="View Dojo on Github (opens new tab)">
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
            </ThemedTooltip>
          </Toolbar>
        </AppBar>
        <Sidebar open={open} handleDrawerClose={handleDrawerClose} />
        <Main open={open}>
          <Toolbar variant="dense" sx={{ display: showNavBar ? 'flex' : 'none' }} />
          {children}
        </Main>
      </div>
    </>
  );
};

export default NavBar;
