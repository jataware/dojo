import React, { useContext } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { lighten, makeStyles } from '@material-ui/core/styles';

import { ThemeContext } from './ThemeContextProvider';

const useStyles = makeStyles((theme) => ({
  appBarRoot: {
    backgroundColor: lighten(theme.palette.primary.light, 0.6),
  },
  toolbar: {
    padding: [[0, theme.spacing(5)]],
    gap: theme.spacing(5),
  },
  dojoIcon: {
    height: '40px',
    width: '40px',
  },
  spacer: {
    flexGrow: 1,
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const { showNavBar } = useContext(ThemeContext);

  if (!showNavBar) {
    return null;
  }

  return (
    <AppBar position="static" classes={{ root: classes.appBarRoot }}>
      <Toolbar variant="dense" disableGutters className={classes.toolbar}>
        <Tooltip title="Dojo home" arrow>
          <IconButton href="/" size="small">
            <img
              src="/assets/Dojo_Logo_black.svg"
              alt="Dojo Logo"
              className={classes.dojoIcon}
            />
          </IconButton>
        </Tooltip>
        <span className={classes.spacer} />
        <Button href="https://www.dojo-modeling.com">Dojo Docs</Button>
        <Button href="https://github.com/dojo-modeling/dojo">Dojo on GitHub</Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
