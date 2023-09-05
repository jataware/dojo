import React from 'react';

import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';

import { Field, getIn, useField } from 'formik';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

import { makeStyles } from 'tss-react/mui';

import FormikSelect from '../../components/formikComponents/FormikSelect';

const useStyles = makeStyles()((theme) => ({
  root: {
    margin: `${theme.spacing(1)} 0`,

    '& .MuiFormHelperText-root': {
      marginLeft: 7,
      marginRight: 5,
    }
  },
  helperText: {
    marginTop: -6,
    color: `${theme.palette.grey[600]} !important`
  }
}));
/**
 * All Form-Aware fields in this directory need to be nested within a Formik's
 * <Formik> <Form> anywhere in the parent react tree.
 * */

/**
 * Text input field that is aware of Formik's Form.
 * Needs to be nested within <Formik><Form> from a parent
 * within the React Tree context.
 * */
export const FormAwareTextField = ({
  name,
  label,
  requiredFn,
  placeholder,
  inputProps = {},
  InputProps = {},
  required,
  validate,
  ...props
}) => {
  const { classes } = useStyles();
  const [field, meta] = useField({ ...props, name, validate });

  return (
    <TextField
      className={classes.root}
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
      {...field}
      placeholder={placeholder}
      helperText={get(meta, 'touched') && get(meta, 'error')}
      error={get(meta, 'error') && get(meta, 'touched')}
      required={required || (isFunction(requiredFn) ? requiredFn(name) : false)}
      {...props}
    />
  );
};

/**
 *
 * */
const FormikCheckbox = (props) => {
  const {
    label,
    field,
    form: { touched, errors, setFieldValue },
    required,
    fullWidth,
    margin,
    helperText,
    ...other
  } = props;
  const { classes } = useStyles();

  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;

  const controlProps = {
    checked: field.value || false,
    color: 'primary',
    onChange: (event) => {
      setFieldValue(field.name, event.target.checked);
    },
  };

  return (
    <FormControl
      variant="standard"
      fullWidth={fullWidth}
      required={required}
      error={hasError}
      {...other}
    >
      <FormControlLabel
        margin={margin}
        control={<Checkbox aria-label={label} {...controlProps} />}
        label={label}
      />
      {helperText && <FormHelperText className={classes.helperText}>{helperText}</FormHelperText>}
      {hasError && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};
FormikCheckbox.defaultProps = {
  required: false,
  fullWidth: true,
  margin: 'dense',
};

/**
 *
 * */
export const FormAwareCheckBox = (props) => (
  <Field
    {...props}
    component={FormikCheckbox}
  />
);

/**
 * Wraps the custom FormikSelect so that we can maintain the same Dataset styling throughout
 * */
export const FormAwareSelect = ({
  options, ...props
}) => (
  <FormikSelect
    {...props}
    margin="dense"
    variant="outlined"
    fullWidth
    options={options}
    squareCorners
  />
);
