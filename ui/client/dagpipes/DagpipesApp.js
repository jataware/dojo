import React, { useEffect } from 'react';
import 'reactflow/dist/style.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import DagDatasetSelector from './DagDatasetSelector';
import PipeEditor from './PipeEditor';
import ModelerProcessing from './ModelerProcessing';
import ModelerSummary from './ModelerSummary';
import { setModelerStep } from './dagSlice'; // Import actions from your Redux slice

const DagSteps = () => {
  const { modelerStep } = useSelector((state) => state.dag);

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
      console.log('There was an error');
  }
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedFlowValue = localStorage.getItem('dagpipes-flow-session');
    if (savedFlowValue) {
      // Update Redux state to skip to the editor step and load the DAG
      // dispatch(setFlowValue(JSON.parse(savedFlowValue)));
      dispatch(setModelerStep(1)); // Assuming 1 is the step for PipeEditor
    }
  }, [dispatch]);

  return (
    <Provider store={store}>
      <DagSteps />
    </Provider>
  );
}

export default App;