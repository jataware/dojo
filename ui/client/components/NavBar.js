import React, { useContext, useState } from 'react';

import axios from 'axios';

import { Link } from 'react-router-dom';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten, makeStyles } from '@material-ui/core/styles';

import { ThemeContext } from './ThemeContextProvider';
import { useAuth } from '../auth';

import ConfirmDialog from './ConfirmDialog';
import BasicAlert from './BasicAlert';

const useStyles = makeStyles((theme) => ({
  appBarRoot: {
    backgroundColor: lighten(theme.palette.primary.light, 0.6),
  },
  toolbar: {
    padding: [[0, theme.spacing(5)]],
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
  userMenuPaper: {
    marginTop: theme.spacing(3),
    width: '160px',
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const { showNavBar } = useContext(ThemeContext);
  const { auth } = useAuth();

  // userMenu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const [accountPageOpen, setAccountPageOpen] = useState(false);

  if (!showNavBar) {
    return null;
  }

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = () => {
    // toggle it if it's already open
    setAccountPageOpen((currentVal) => !currentVal);
    // add a slight delay to prevent it from closing too fast
    setTimeout(() => handleUserMenuClose(), 400);
  };

  const handleLogout = () => {
    axios.post('/api/dojo/auth/logout')
      // todo: add confirm logout
      .then(() => window.location.replace('/'))
      .catch(() => {
        setConfirmLogoutOpen(false);
        setLogoutError(true);
      });
  };

  const handleCloseAccount = () => {
    // toggle the account page shut if it is open
    if (accountPageOpen) {
      setAccountPageOpen(false);
    }
  };

  const userMenu = () => (
    <div>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleUserMenuClick}
        size="small"
        startIcon={<AccountCircleIcon />}
      >
        {auth.user}
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        classes={{ paper: classes.userMenuPaper }}
      >
        <MenuItem onClick={() => setConfirmLogoutOpen(true)}>
          Logout
        </MenuItem>
        <MenuItem onClick={handleAccountClick}>
          Account
        </MenuItem>
      </Menu>
      {confirmLogoutOpen && (
        <ConfirmDialog
          accept={handleLogout}
          open={confirmLogoutOpen}
          reject={() => setConfirmLogoutOpen(false)}
          title="Are you sure you want to logout?"
        />
      )}
      {accountPageOpen && (
        <iframe
          title="keycloakAccountPage"
          src={`${auth.keycloak_url}/account`}
          style={{
            height: 'calc(100vh - 48px)',
            width: '100vw',
            border: 'none',
            position: 'absolute',
            left: 0,
            top: '48px',
            overflow: 'auto',
          }}
        />
      )}
      <BasicAlert
        alert={{
          message: 'There was an error logging out, please try again.',
          severity: 'error',
        }}
        visible={logoutError}
        setVisible={setLogoutError}
      />
    </div>
  );

  return (
    <>
      <AppBar position="static" classes={{ root: classes.appBarRoot }}>
        <Toolbar variant="dense" disableGutters className={classes.toolbar}>
          <Tooltip title="Dojo home" arrow>
            <IconButton
              component={Link}
              onClick={handleCloseAccount}
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
          {auth.isAuthenticated && (
            <>
              <Button
                component={Link}
                onClick={handleCloseAccount}
                to="/models"
              >
                Models
              </Button>
              <Button
                component={Link}
                onClick={handleCloseAccount}
                to="/datasets"
              >
                Datasets
              </Button>
              <Button
                component={Link}
                onClick={handleCloseAccount}
                to="/runs"
              >
                Model Runs
              </Button>
            </>
          )}
          <span className={classes.spacer} />
          <Button href="https://www.dojo-modeling.com" target="_blank">Documentation</Button>
          <Button href="https://github.com/dojo-modeling/dojo" target="_blank">GitHub</Button>
          {(auth.isAuthenticated && auth.user) && userMenu()}
        </Toolbar>
      </AppBar>

    </>
  );
};

export default NavBar;
