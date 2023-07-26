import React from 'react';
import { withStyles } from '@mui/material/styles';
import { Field, useField } from 'formik';

import { TextField } from 'material-ui-formik-components/TextField';

import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorCircleIcon from '@mui/icons-material/ErrorRounded';
import identity from 'lodash/identity';

/**
 * Accepts a validate function and memoizes the validation logic,
 * as well as displays the Formik's form validation errors.
 * Encapsulates logic for displaying good/bad icons on custom validation.
 * As of June 2023, used exclusively for Date inputs with backend validation
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
  // store a reference to the previous error state in case we switch form types (geo/date/feat)
  const [prevError, setPrevError] = React.useState(null);

  // // Would run on each form context change, blur, and render
  const validateOnChange = (value) => {
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
      setPrevError(meta.error);
      return meta.error;
    }
    // only run the backend validation if the value has changed
    if (value !== prevValue) {
      setPrevError(meta.error);
      setPrevValue(value);
      return validateOnChange(value);
    }
  };

  /**
  * Most validation happens through the validate function above (passed as the `validate` prop to
  * <Field>). But we need to 1. run an initial validation and 2. ensure that we revalidate
  * whenever we come back to this form if the user switches away to Geo/Feature then comes back
  * otherwise they can save with invalid values.
  * This useEffect runs these validations, because the validate function above is set up to only
  * run when the value changes - without this check it would run on every single
  * keystroke/change in the whole form. Not good with an API call.
  **/
  React.useEffect(() => {
    // copy of validateOnChange function in here because wrapping the external one in useCallback
    // means that the value would be pinned to when the deps change (and value isn't a dep)
    const validateInEffect = (value) => {
      if (parentName) {
        return validateFormat(parentName, value);
      }
      return '';
    };

    // if meta.error isn't equal to our saved error and it is undefined, then run this
    // because it may mean that our error state has been wiped by Formik and we want to restore it
    // this happens when we switch form types (geo/feature) and then switch back
    if (prevError !== meta.error && meta.error === undefined) {
      // setTouched or the field won't display errors
      if (!meta.touched) helpers.setTouched(true, true);
      // make them match immediately to prevent infinite looping
      // on initial mount prevError=null, meta.error=undefined, and the request below is delayed
      // so we need to do this to ensure that we will only do this once
      setPrevError(meta.error);

      const initialValidationResult = validateInEffect(field.value);

      Promise
        .resolve(initialValidationResult)
        .then((invalid) => {
          // if we get back an error - 'invalid' contains the error message
          if (invalid) {
            // set both our local state and the Formik error state to match it
            setPrevError(meta.error);
            helpers.setError(invalid);
          }
        });
    }
  }, [helpers, meta, field.value, parentName, validateFormat, prevError]);

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
