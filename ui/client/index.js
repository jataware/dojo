import React from 'react';
import { createRoot } from 'react-dom/client';

import './style.css';

import CssBaseline from '@mui/material/CssBaseline';
import {
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
import ViewDocuments from './documents';
import UploadDocument from './documents/upload';
import ViewModels from './components/ViewModels';
import ViewRuns from './components/ViewRuns';
import DatasetRegistrationStepper from './datasets/RegistrationStepper';
import DatasetPreview from './datasets/Preview';
import DatasetAnnotate from './datasets/Annotate';
import DagpipesApp from './dagpipes/DagpipesApp';

export default function Main() {
  return (
    <Router>
      <NavBar />
      <Switch>
        <Route component={LandingPage} exact path="/" />
        <Route component={Model} exact path="/model" />
        <Route component={ViewModels} exact path="/models" />
        <Route component={ViewDatasets} exact path="/datasets" />
        <Route component={ViewDocuments} exact path="/documents" />
        <Route component={UploadDocument} exact path="/documents/upload" />
        <Route component={DatasetAnnotate} exact path="/datasets/annotate" />
        <Route component={DatasetPreview} exact path="/datasets/preview" />
        <Route component={DatasetRegistrationStepper} path="/datasets/:flowslug/:step?/:datasetId?" />
        <Route component={Provision} exact path="/provision/:modelId" />
        <Route component={Provisioning} exact path="/provisioning/:modelId" />
        <Route component={Terminal} exact path="/term/:modelid" />
        <Route component={Summary} exact path="/summary/:modelId" />
        <Route component={DatasetSummary} exact path="/dataset_summary" />
        <Route component={Admin} exact path="/admin" />
        <Route component={ViewRuns} exact path="/runs" />
        <Route component={RunSummary} exact path="/runs/:runid" />
        <Route component={RunLogs} exact path="/runlogs/:runid" />
        <Route component={DagpipesApp} exact path="/dagpipes" />
        <Route path="/*" render={() => <h2>404 Not Found</h2>} />
      </Switch>
    </Router>
  );
}

const container = document.getElementById('app');

const root = createRoot(container);

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeContextProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Main />
        </LocalizationProvider>
      </ThemeContextProvider>
    </ThemeProvider>
  </StyledEngineProvider>,
);

module.hot.accept();
