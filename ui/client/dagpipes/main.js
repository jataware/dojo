import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './store';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material/styles';
import './index.css';

ReactDOM.createRoot(document.getElementById('root'))
  .render(
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <Provider store={store}>
          <App />
        </Provider>
      </StyledEngineProvider>
    </React.StrictMode>
  );
