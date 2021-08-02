import React from 'react';

import * as yup from 'yup';
import Button from '@material-ui/core/Button';

import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import { ChipInput } from 'material-ui-formik-components/ChipInput';
import { KeyboardDatePicker } from 'material-ui-formik-components/KeyboardDatePicker';
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
  datePickerContainer: {
    display: 'flex',
    '& > *': {
      marginRight: theme.spacing(10),
      maxWidth: '220px',
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
  period: yup.object().shape({
    gte: yup.date().nullable(),
    lte: yup.date().nullable(),
  }),
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
        {/* eslint-disable-next-line react/no-unknown-property */}
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
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div className={classes.datePickerContainer}>
              <Field
                component={KeyboardDatePicker}
                format="MM/dd/yyyy"
                label="Model Start Date"
                name="period.gte"
                placeholder="mm/dd/yyyy"
                variant="inline"
              />
              <Field
                format="MM/dd/yyyy"
                component={KeyboardDatePicker}
                label="Model End Date"
                name="period.lte"
                placeholder="mm/dd/yyyy"
                variant="inline"
              />
            </div>
          </MuiPickersUtilsProvider>
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
