import React from 'react';
// import { Field, Formik, Form } from 'formik';

import RunJobs from '../client/datasets/RunJobs';

export default {
  title: 'Dataset Registration/Run Job',
  component: RunJobs,
  decorators: [
    (Story) => (
      <div style={{height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column'}}>
          <Story />
      </div>
    )
  ]
};

const Template = (args) => (
    <RunJobs {...args} />
);

export const Basic = {
    args: {
        datasetInfo: {id: '1'},
        stepLabel: "Analyze",
        stepTitle: "Analyzing Dataset",
        handleNext: null,
        handleBack: null,
      jobs: [{id: '2'}]
    }
};
