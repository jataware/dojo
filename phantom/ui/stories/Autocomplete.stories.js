import React, { useState } from 'react';
import Autocomplete from '../client/components/Autocomplete';

export default {
  title: 'Autocomplete',
  component: Autocomplete,
};

const Template = (args) => <Autocomplete {...args} />;

const options = ['col1', 'col2'];

export const emptyUncontrolled = {
  args: {
    values: [],
    options,
    setValues: () => null,
  }
};

export const preFilledUncontrolled = {
  args: {
    values: ['col1'],
    options,
    setValues: () => null,
  }
};

export const Controlled = () => {
  const [values, setValues] = useState([]);

  return (
    <Autocomplete
      options={options}
      setValues={setValues}
      label="Test Label"
      values={values} />
  );

}
