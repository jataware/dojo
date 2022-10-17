import React from 'react';
import { Field, Formik, Form } from 'formik';
import MultiColumnDateSelector from '../client/datasets/annotations/MultiColumnDateSelector';
import { initialValues } from '../client/datasets/annotations/ColumnPanel';

export default {
  title: 'Dataset Registration/MultiColumnDateSelector',
  component: MultiColumnDateSelector,
  decorators: [
    (Story) => (
      <Formik initialValues={initialValues}>
        <Form>
          <Story />
        </Form>
      </Formik>
    )
  ]
};

const Template = (args) => (
    <MultiColumnDateSelector {...args} />
);

export const Basic = {
  args: {
    columns: [{field: 'latitude', headerName: 'Latitude'},
              {field: 'date', headerName: 'Date'}],
    editingColumn: {
      name: 'date',
      date_type: 'year',
    },
    values: {
      'date.multi-column.year': 'latitude',
      'date.multi-column.month': 'latitude',
      'date.multi-column.day': 'date'
    },
    setFieldValue: () => null
    }
};
