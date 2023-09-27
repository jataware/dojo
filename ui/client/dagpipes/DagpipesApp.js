import React, { useState } from 'react';
import 'reactflow/dist/style.css';

import { Provider } from 'react-redux';

import { store } from './store';
import DagDatasetSelector from './DagDatasetSelector';
import PipeEditor from './PipeEditor';
import ModelerProcessing from './ModelerProcessing';

const DagSteps = () => {
  const [step, setStep] = useState('select');

  switch (step) {
    case 'select':
      return <DagDatasetSelector setStep={setStep} />;
    case 'edit':
      return <PipeEditor setStep={setStep} />;
    case 'process':
      return <ModelerProcessing setStep={setStep} />;
    default:
      // TODO: error page?
      console.log('There was an error');
  }
};

function App() {
  return (
    <Provider store={store}>
      <DagSteps />
    </Provider>
  );
}

export default App;
