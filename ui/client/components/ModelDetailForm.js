import React from 'react';

import * as yup from 'yup';
import Button from '@material-ui/core/Button';

import { ChipInput } from 'material-ui-formik-components/ChipInput';
import { RadioGroup } from 'material-ui-formik-components/RadioGroup';
import { makeStyles } from '@material-ui/core/styles';
import { Field, FormikProvider, useFormik } from 'formik';

import FormikTextField from './FormikTextField';

const useStyles = makeStyles((theme) => ({
  desc: {
    marginTop: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    '& :first-child': {
      marginRight: theme.spacing(1),
    },
  },
}));

const validationSchema = yup.object({
  maintainerName: yup
    .string('Enter the name of the model maintainer')
    .required('Maintainer information is required'),
  email: yup
    .string('Enter the email address of the model maintainer')
    .email()
    .required('Maintainer information is required'),
  organization: yup
    .string("Enter the name of the maintainer's organization"),
  stochastic: yup
    .string('Is the model stocashtic?')
    .required('Is your model stochastic?'),
  // category: yup
  // .array('What categories apply to the model?')
  // .required('What categories apply to the model?')
});

export const ModelDetail = ({
  modelInfo, handleBack, handleNext
}) => {
  const classes = useStyles();
  const formik = useFormik({
    initialValues: modelInfo,
    validationSchema,
    onSubmit: (values) => handleNext(values),
  });

  return (
    <FormikProvider value={formik}>
      <div>
        <form onSubmit={formik.handleSubmit}>
          <FormikTextField
            autoFocus
            name="maintainerName"
            label="Maintainer Name"
            formik={formik}
          />
          <FormikTextField
            name="email"
            label="Maintainer Email"
            formik={formik}
          />
          <FormikTextField
            name="organization"
            label="Maintainer Organization"
            formik={formik}
          />
          <Field
            required
            name="stochastic"
            component={RadioGroup}
            value={formik.values.stochastic}
            label="Is this model stochastic?"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]}
            groupProps={{ row: true }}
          />
          <Field
            name="category"
            component={ChipInput}
            value={formik.values.category}
            label="Category (type a category and press space)"
          />
          <div className={classes.buttonContainer}>
            <Button onClick={() => handleBack(formik.values)}>
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
    </FormikProvider>
  );
};
