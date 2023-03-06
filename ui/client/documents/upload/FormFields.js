import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

/**
 * Special-purpose TextField for document upload. It calls onChange on blurring fields,
 * optimizing re-renders. Does not use formik, as the parent controls its value
 * for the selected file.
 **/
export const ManagedTextField = ({label, InputProps, inputProps, placeholder, onChange, value, ...props}) => {

  const [internalValue, setInternalValue] = useState("");

  const displayValue = internalValue || value;

  const handleChange = (event) => {
    setInternalValue(event.target.value);
  };

  const handleBlur = () => {
    onChange(internalValue || value);
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      InputLabelProps={{ shrink: true }}
      InputProps={{
        style: { borderRadius: 0 },
        ...InputProps
      }}
      inputProps={{
        'aria-label': label,
        ...inputProps
      }}
      placeholder={placeholder}
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      value={displayValue}
    />
  );
};

