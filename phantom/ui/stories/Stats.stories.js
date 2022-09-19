import React from 'react';
import { Field, Formik, Form } from 'formik';

import Stats from '../client/datasets/annotations/Stats';

export default {
  title: 'Dataset Registration/Stats',
  component: Stats,

  decorators: [
    (Story) => (
        <div style={{maxWidth: '35rem'}}>
            <Story />
        </div>
    )
  ]
};

const Template = (args) => (
    <Stats {...args} />
);

const statistics = {
  "count": 2757,
  "mean": 11.1297331157,
  "std": 2.4310898314,
  "min": 3.5391,
  "25%": 9.3591,
  "50%": 11.5712,
  "75%": 13.4021,
  "max": 14.6953
};

const histogramData = {
  data: [12, 19, 3, 5, 2, 3, 12, 19, 3, 40],
  labels: ['-3', '1', '5', '9', '15', '20', '25', '30', '40', '50', '60'],
};

export const Basic = {
  args: {
    statistics,
    histogramData
  }
};
