import React from 'react';
import './App.css';
import 'reactflow/dist/style.css';

import { Provider } from 'react-redux';

import { store } from './store';
import Layout from './Layout';
import PipeEditor from './PipeEditor';

function App() {
  return (
    <Provider store={store}>
      <Layout>
        <div>
          <PipeEditor />
        </div>
      </Layout>
    </Provider>
  );
}

export default App;
