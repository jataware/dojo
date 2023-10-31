import React from 'react';

import TextField from '@mui/material/TextField';

const ModelerSelect = ({
  value, label, onChange, options, children, name
}) => (
  <TextField
    InputLabelProps={{
      shrink: true,
    }}
    fullWidth
    label={label}
    select
    // nodrag is a react-flow class that prevents this from moving when the select is open
    className="nodrag"
    value={value}
    onChange={onChange}
    SelectProps={{
      native: true
    }}
    name={name}
    sx={{ backgroundColor: 'grey.50' }}
  >
    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
    <option value="" />
    {children
      || options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
  </TextField>
);

export default ModelerSelect;
