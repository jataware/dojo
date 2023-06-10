import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, useField } from 'formik';

import { TextField } from 'material-ui-formik-components/TextField';

import InputAdornment from '@material-ui/core/InputAdornment';
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded';
import ErrorCircleIcon from '@material-ui/icons/ErrorRounded';
import identity from 'lodash/identity';

/**
 * Accepts a validate function and memoizes the validation logic,
 * as well as displays the Formik's form validation errors.
 * Encapsulates logic for displaying good/bad icons on custom validation.
 * */
export default withStyles(() => ({
  root: {
  },
  valid: {
    color: 'green'
  },
  invalid: {
    color: 'red'
  }
}))(({
  classes, validateFormat = identity, parentName, InputProps, ...props
}) => {
  const [field, meta, helpers] = useField(props.name);
  const valid = !meta?.error;
  const [prevValue, setPrevValue] = React.useState(field.value);

  // // Would run on each form context change, blur, and render
  const validateAlways = (value) => {
    if (parentName) {
      return validateFormat(parentName, value);
    }
    return '';
  };

  const validate = (value) => {
    // if we haven't changed the value and it's still invalid, then keep our error
    // otherwise it gets wiped when we revalidate on blur/change unless we re-run our backend
    // validation with every other field change
    if (value === prevValue && !valid) {
      return meta.error;
    }
    // only run the backend validation if the value has changed
    if (value !== prevValue) {
      setPrevValue(value);
      return validateAlways(value);
    }
  };

  // // Run validate on mount
  React.useEffect(() => {
    const initialValidate = (value) => {
      if (parentName) {
        return validateFormat(parentName, value);
      }
      return '';
    };

    // Also set touched to force error on mount:
    if (!meta.touched) {
      helpers.setTouched(true, true);

      const initialValidationResult = initialValidate(field.value);

      Promise
        .resolve(initialValidationResult)
        .then((invalid) => {
          if (invalid) {
            helpers.setError(invalid);
          }
        });
    }
  }, [helpers, meta, field.value, parentName, validateFormat]);

  return (
    <Field
      validate={validate}
      className={classes.root}
      component={TextField}
      variant="outlined"
      fullWidth
      margin="dense"
      InputLabelProps={{ shrink: true }}
      InputProps={{
        endAdornment: field.value && (
          <InputAdornment position="end">
            {valid ? (
              <CheckCircleIcon className={classes.valid} />
            ) : (
              <ErrorCircleIcon className={classes.invalid} />
            )}
          </InputAdornment>
        ),
        style: { borderRadius: 0 },
        ...InputProps
      }}
      {...props}
    />
  );
});
