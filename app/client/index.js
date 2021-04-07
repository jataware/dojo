import './style.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Intro from './intro';
import App from './app';
import Admin from './admin';

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#000'
    }
  },
  body: {
    backgroundColor: '#000'
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
