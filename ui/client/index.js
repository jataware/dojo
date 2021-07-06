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
import LandingPage from './landingpage';
import Model from './model';
import PublishContainer from './publish_container';
import Summary from './summary';
import TermLoading from './term_loading';
import TheKing from './theking';

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
  return (
    <Router>
      <Switch>
        <Route component={LandingPage} exact path="/" />
        <Route component={Model} exact path="/model" />
        <Route component={Intro} exact path="/intro" />
        <Route component={TermLoading} exact path="/loadingterm" />
        <Route component={App} exact path="/term/:worker/:model" />
        <Route component={Summary} exact path="/summary/:worker" />
        <Route component={PublishContainer} exact path="/publishcontainer/:worker" />
        <Route component={Admin} exact path="/admin" />
        <Route component={TheKing} exact path="/theking" />
        <Route path="/*" render={() => <h2>404 Not Found</h2>} />
      </Switch>
    </Router>
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
