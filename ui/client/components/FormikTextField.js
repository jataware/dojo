import React from 'react';

import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: [[theme.spacing(1), 0]],
  },
}));
function FormikTextField({
  name, label, formik, ...props
}) {
  const classes = useStyles();
  // apply our three default props to make the default formik textfield
  // and then any other MUI TextField props passed in are spread with ...props
  return (
    <TextField
      /* eslint-disable react/jsx-props-no-spreading */
      {...props}
      className={classes.root}
      fullWidth
      id={name}
      name={name}
      label={label}
      value={formik.values[name]}
      onChange={formik.handleChange}
      error={formik.touched[name] && Boolean(formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
    />
  );
}

export default FormikTextField;
