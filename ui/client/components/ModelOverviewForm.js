import React from 'react';

import * as yup from 'yup';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { useFormik } from 'formik';

import FormikTextField from './FormikTextField';

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    marginTop: theme.spacing(2),
    '& :first-child': {
      marginRight: theme.spacing(1),
    },
  },
}));

const validationSchema = yup.object({
  name: yup
    .string('Enter your model name')
    .required('Model name is required'),
  website: yup
    .string('Enter your repository URL')
    .url()
    .required('Model website is required'),
  family_name: yup
    .string('Enter the model family name')
    .required('Model family is required'),
  description: yup
    .string('Enter a model description')
    .min(8, 'Description should be at least 250 characters')
    .required('Description is required'),
});

export const ModelOverview = ({
  modelInfo, handleNext
}) => {
  const classes = useStyles();
  const formik = useFormik({
    initialValues: modelInfo,
    validationSchema,
    onSubmit: (values) => {
      handleNext(values);
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <FormikTextField
          autoFocus
          name="name"
          label="Model Name"
          formik={formik}
        />
        <FormikTextField
          name="website"
          label="Model Website"
          formik={formik}
          type="url"
        />
        <FormikTextField
          name="family_name"
          label="Model Family"
          formik={formik}
        />
        <FormikTextField
          name="description"
          label="Model Description"
          formik={formik}
          type="description"
          multiline
          rows={4}
          variant="outlined"
        />
        <div className={classes.buttonContainer}>
          <Button disabled>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};
