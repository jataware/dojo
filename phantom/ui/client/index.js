import React, { useContext, createContext, useState } from 'react';

import './style.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import KeyCloak from 'keycloak-js';
import ReactDOM from 'react-dom';
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from 'react-router-dom';

import { ThemeProvider } from '@material-ui/core/styles';

import NavBar from './components/NavBar';
import ThemeContextProvider from './components/ThemeContextProvider';

// pages
import Admin from './admin';
import DatasetSummary from './dataset_summary';
import LandingPage from './landingpage';
import Model from './model';
import Provision from './provision';
import Provisioning from './provisioning';
import RunLogs from './runlogs';
import RunSummary from './components/RunSummary';
import Summary from './summary';
import Terminal from './terminal';
import theme from './theme';
import ViewDatasets from './components/ViewDatasets';
import ViewModels from './components/ViewModels';
import ViewRuns from './components/ViewRuns';
// import DatasetRegistration from './datasets/Register';
import DatasetRegistrationStepper from './datasets/RegistrationStepper';
import DatasetPreview from './datasets/Preview';
import DatasetAnnotate from './datasets/Annotate';


const auth_base = 'http://localhost:8079';
const keycloak = new KeyCloak({
  url: auth_base,
  realm: 'Uncharted',
  clientId: 'causemos',
});


export default function Main() {
  return (
    <ReactKeycloakProvider authClient={keycloak}>
      <Router>
        <NavBar />
        <Switch>
          <Route component={LandingPage} exact path="/" />
          <ProtectedRoute component={Model} exact path="/model" />
          <ProtectedRoute component={ViewModels} exact path="/models" />
          <ProtectedRoute component={ViewDatasets} exact path="/datasets" />
          <ProtectedRoute component={DatasetAnnotate} exact path="/datasets/annotate" />
          <ProtectedRoute component={DatasetPreview} exact path="/datasets/preview" />
          <ProtectedRoute component={DatasetRegistrationStepper} path="/datasets/:flowslug/:step?/:datasetId?" />
          <ProtectedRoute component={Provision} exact path="/provision/:modelId" />
          <ProtectedRoute component={Provisioning} exact path="/provisioning/:modelId" />
          <ProtectedRoute component={Terminal} exact path="/term/:modelid" />
          <ProtectedRoute component={Summary} exact path="/summary/:modelId" />
          <ProtectedRoute component={DatasetSummary} exact path="/dataset_summary" />
          <ProtectedRoute component={Admin} exact path="/admin" />
          <ProtectedRoute component={ViewRuns} exact path="/runs" />
          <ProtectedRoute component={RunSummary} exact path="/runs/:runid" />
          <ProtectedRoute component={RunLogs} exact path="/runlogs/:runid" />
          <Route path="/*" render={() => <h2>404 Not Found</h2>} />
        </Switch>
      </Router>
    </ReactKeycloakProvider>
  );
}

function ProtectedRoute({ children, ...props }) {
  const { keycloak } = useKeycloak();
  console.log(keycloak);
  const isLoggedIn = keycloak.authenticated;
  if (isLoggedIn) {
    return <Route {...props} render={ () => children }/>
  }
  else {
    keycloak.login();
    return <h1>Redirecting to login</h1>
    // return <Redirect to="/"/>
  }
}

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ThemeContextProvider>
      <Main />
    </ThemeContextProvider>
  </ThemeProvider>,
  document.getElementById('app')
);


module.hot.accept();
