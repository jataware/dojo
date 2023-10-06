import React from 'react';
import { useField, useFormikContext } from 'formik';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

// removes the [' '] from dataset multicolumn date & geo, which are there
// because of the formik getIn selector & its difficulties with .nested names
// but we need to match the name with the errors object name, which doesn't have the ['']
function stripBrackets(str) {
  if (str.startsWith("['") && str.endsWith("']")) {
    return str.substring(2, str.length - 2);
  }
  // if it doesn't have the brackets, return the original string
  return str;
}

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
  const { setFieldValue, errors, touched } = useFormikContext();
  const [field] = useField(name);

  const configSelect = {
    ...field,
    ...props,
    value: field.value,
    onChange: (event) => setFieldValue(name, event.target.value),
  };

  const isError = touched[stripBrackets(name)] && errors[stripBrackets(name)];

  return (
    <FormControl {...props} error={!!isError}>
      <InputLabel shrink>{props.label}</InputLabel>
      <Select
        notched
        {...configSelect}
        // if not squareCorners, default to theme.shape.borderRadius (4px)
        sx={{ borderRadius: squareCorners ? 0 : 1 }}
        inputProps={{
          'aria-label': props.label,
        }}
        displayEmpty
      >
        {options?.map((option, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <MenuItem key={index} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
      {isError && <FormHelperText>{errors[stripBrackets(name)]}</FormHelperText>}
    </FormControl>
  );
};

export default FormikSelect;
