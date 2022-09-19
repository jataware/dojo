import React from 'react';
import Progress from '../client/datasets/Progress';

export default {
  title: 'Dataset Registration/Progress',
  component: Progress,
};

const Template = (args) => (
    <Progress {...args} />
);

export const Basic = {
  args: {
    annotations: []
  }
};
