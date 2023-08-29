import React from 'react';
import { useField, useFormikContext } from 'formik';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

/**
 * Wraps MUI RadioGroup for easier use with Formik. Needs to be within a Formik form.
 * options prop is required and needs to include value & label
 * */
const FormikSelect = ({
  name,
  options,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(name);

  const configRadio = {
    ...field,
    ...props,
    value: field.value || null,
    onChange: (event) => setFieldValue(name, event.target.value),
  };

  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <RadioGroup
        {...configRadio}
        inputProps={{
          'aria-labelledby': props.label,
        }}
      >
        {options?.map((option, index) => (
          <FormControlLabel
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default FormikSelect;
