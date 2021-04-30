import React from 'react';

import './style.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import ReactDOM from 'react-dom';
import {
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Admin from './admin';
import App from './app';
import Intro from './intro';
import { WebSocketContextProvider } from './context';

const theme = createMuiTheme({
  palette: {
    // type: 'dark',
    background: {
      default: '#fff'
    }
  },
  body: {
    backgroundColor: '#fff'
  },
  overrides: {
    MuiTableCell: {
      root: {
        padding: 0
      }
    }
  }
});

export default function Main() {
  const url = `ws://${window.location.host}/ws`;

  return (
    <WebSocketContextProvider url={url} autoConnect>
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
    </WebSocketContextProvider>
  );
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Main />
  </ThemeProvider>,
  document.getElementById('app')
);

module.hot.accept();
