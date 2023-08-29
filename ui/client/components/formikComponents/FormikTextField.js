import React from 'react';
import { useField, useFormikContext } from 'formik';
import TextField from '@mui/material/TextField';

const FormikTextField = ({ name, validate, ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField({ ...props, name, validate });

  const configTextField = {
    ...field,
    ...props,
    onChange: (event) => setFieldValue(name, event.target.value),
    error: meta.touched && Boolean(meta.error),
    helperText: meta.touched ? meta.error : ''
  };

  return <TextField {...configTextField} />;
};

export default FormikTextField;
