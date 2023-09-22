import React from 'react';
import 'reactflow/dist/style.css';

import isEmpty from 'lodash/isEmpty';

import { Provider, useSelector } from 'react-redux';

import { store } from './store';
import DagDatasetSelector from './DagDatasetSelector';
import PipeEditor from './PipeEditor';

const DagSteps = () => {
  const { savedDatasets } = useSelector((state) => state.dag);

  if (!isEmpty(savedDatasets)) {
    return <PipeEditor />;
  }

  return <DagDatasetSelector />;
};

function App() {
  return (
    <Provider store={store}>
      <DagSteps />
    </Provider>
  );
}

export default App;
