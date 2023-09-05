import React from 'react';
import { useField, useFormikContext } from 'formik';

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

/**
 *
 * */
const FormikSwitch = ({
  name,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);

  const configSwitch = {
    ...field,
    ...props,
    checked: field.value ?? false,
    onChange: (event) => setFieldValue(name, event.target.checked),
    inputProps: { 'aria-label': props.label }
  };

  return (
    <FormControlLabel {...props} control={<Switch {...configSwitch} />} />
  );
};

export default FormikSwitch;
