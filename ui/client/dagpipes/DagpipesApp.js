import React from 'react';
import './App.css';
import 'reactflow/dist/style.css';

import { Provider } from 'react-redux';

import { store } from './store';
import PipeEditor from './PipeEditor';

function App() {
  return (
    <Provider store={store}>
      <PipeEditor />
    </Provider>
  );
}

export default App;
