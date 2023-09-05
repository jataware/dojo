import React from 'react';
import { useField, useFormikContext } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FormikDatePicker = ({ name, ...otherProps }) => {
  const { setFieldValue } = useFormikContext();
  const [field, meta] = useField(name);

  const configDatePicker = {
    ...field,
    ...otherProps,
    value: field.value ? new Date(field.value) : null,
    onChange: (value) => setFieldValue(name, value),
    error: meta.touched && Boolean(meta.error),
    helperText: meta.touched ? meta.error : ''
  };

  return <DatePicker {...configDatePicker} />;
};

export default FormikDatePicker;
