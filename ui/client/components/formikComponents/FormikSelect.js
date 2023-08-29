import React from 'react';
import { useField, useFormikContext } from 'formik';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

/**
 * Wraps MUI Select for easier use with Formik. Needs to be within a Formik form.
 * options prop is required and needs to include value & label
 * */
const FormikSelect = ({
  name,
  options,
  squareCorners = false,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);

  const configSelect = {
    ...field,
    ...props,
    value: field.value || null,
    onChange: (event) => setFieldValue(name, event.target.value),
  };

  return (
    <FormControl {...props}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        {...configSelect}
        // if not squareCorners, default to theme.shape.borderRadius (4px)
        sx={{ borderRadius: squareCorners ? 0 : 1 }}
        inputProps={{
          'aria-label': props.label,
        }}
      >
        {options?.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FormikSelect;
