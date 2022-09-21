import React, { useContext, createContext, useState } from 'react';

import './style.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import KeyCloak from 'keycloak-js';
import ReactDOM from 'react-dom';

import {
  Route,
  BrowserRouter as Router,
  Switch,
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

let keycloak;

export default function Main() {
  return (
    <AuthWrapper>
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
    </AuthWrapper>
  );
}

const authContext = createContext();

function AuthWrapper({ children }) {
  
  const auth_base = 'http://localhost:8079';
  keycloak = new KeyCloak({
    url: auth_base,
    realm: 'Uncharted',
    clientId: 'causemos',
  });
  keycloak.init({
    onLoad: 'check-sso',
    enableLogging: true,
  }).then((authenticated) => {
    console.log(authenticated);
    if (authenticated) {
      keycloak.loadUserInfo().then((userInfo) => {
        console.log(userInfo);
        // setUser(userInfo);
      });
    }
    else {
      // setUser(false);
    }
  });
  console.log(keycloak);

  return (
    <authContext.Provider value={{}}>
      {children}
    </authContext.Provider>
  )
}

function useAuth() {
  console.log("useAuth");
  console.log(authContext);
  return useContext(authContext);
}


function ProtectedRoute({ children, ...props }) {
  const [user, setUser] = useState(null);

  let auth = useAuth();
  console.log(auth);
  console.log(props);
  console.log("auth");
  // if (auth.user === null) {
  //   return <h1>Loading</h1>
  // }
  // else {
  //   console.log(auth);
  //   return <h1>LOADED!!!!!</h1>
  // }
  // if (!weycloak.authenticated) {
  //   keycloak.login();
  //   console.log("Not logged in!"); //   console.log(keycloak);

  //   // window.location = "/";
  //   // return <h1>Not logged in. Redirecting home.</h1>;
  // }
  // else {
  //   console.log("Logged in!");
  //   return <Route {...props} render={
  //     ({ location }) => {
  //       return children;
  //     }
  //   }
  //   />
  // }
  return {user: user}
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
