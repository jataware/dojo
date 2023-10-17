import React from 'react';
import 'reactflow/dist/style.css';

import { Provider, useSelector } from 'react-redux';

import { store } from './store';
import DagDatasetSelector from './DagDatasetSelector';
import PipeEditor from './PipeEditor';
import ModelerProcessing from './ModelerProcessing';
import ModelerSummary from './ModelerSummary';

const DagSteps = () => {
  const { modelerStep } = useSelector((state) => state.dag);
  // TODO: change this to be in redux so we don't lose state every time there's a code change
  // const [step, setStep] = useState('select');

  switch (modelerStep) {
    case 0:
      return <DagDatasetSelector />;
    case 1:
      return <PipeEditor />;
    case 2:
      return <ModelerProcessing />;
    case 3:
      return <ModelerSummary />;
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
