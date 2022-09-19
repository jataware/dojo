import React from 'react';
import { Field, Formik, Form } from 'formik';

import { Aliases } from '../client/datasets/annotations/Aliases';

export default {
  title: 'Dataset Registration/Aliases',
  component: Aliases,

  decorators: [
    (Story) => (
      <Formik>
        {(formik) => (
        <Form>
          <Story />
        </Form>
        )}
      </Formik>
    )
  ]
};

const Template = (args) => (
    <Aliases {...args} />
);

export const Basic = {
  args: {
    aliases: [
      { id: 1, current: 'hi', new: 'sample' }
    ]
  }
};
