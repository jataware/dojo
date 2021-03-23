import './style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Intro from './intro';
import App from './app';
import Admin from './admin';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  overrides: {
    MuiListItem: {
      root: { },
      dense: {
        margin: 0,
        padding: 0,
        'padding-top': 0,
        'padding-bottom': 0

      }
    },
    MuiListItemText: {
      dense: {
        padding: 0,
        margin: 0
      }
    }

  }
});

export default function Main() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Intro />
        </Route>
        <Route path="/term">
          <App />
        </Route>
        <Route path="/admin">
          <Admin />
        </Route>
        <Route path="/*" render={() => <h2>404 Not Found</h2>} />
      </Switch>
    </Router>
  );
}

ReactDOM.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <Main />
  </ThemeProvider>,
  document.getElementById('app')
);

module.hot.accept();
