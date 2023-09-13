import React from 'react';
import './App.css';
import 'reactflow/dist/style.css';

import { Provider } from 'react-redux';

import { store } from './store';
import DagDatasetSelector from './DagDatasetSelector';
import PipeEditor from './PipeEditor';

function App() {
  return (
    <Provider store={store}>
      <DagDatasetSelector />
      <PipeEditor />
    </Provider>
  );
}

export default App;
