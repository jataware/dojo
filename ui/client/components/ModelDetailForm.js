import React, { useEffect } from 'react';

import * as yup from 'yup';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Button from '@material-ui/core/Button';

import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import { KeyboardDatePicker } from 'material-ui-formik-components/KeyboardDatePicker';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
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

export const detailValidationSchema = yup.object({
  maintainer: yup.object().shape({
    name: yup
      .string('Enter the name of the model maintainer')
      .required('Maintainer information is required'),
    email: yup
      .string('Enter the email address of the model maintainer')
      .email()
      .required('Maintainer information is required'),
    organization: yup
      .string("Enter the name of the maintainer's organization"),
  }),
  period: yup.object().shape({
    gte: yup.date().nullable(),
    lte: yup.date().nullable(),
  }),
});

export const ModelDetailFields = ({
  formik
}) => {
  const classes = useStyles();

  const [domainList, setDomainList] = React.useState([]);

  useEffect(() => {
    if (domainList.length === 0) {
      axios('/api/dojo/dojo/domains').then((response) => { setDomainList(response.data); });
    }
  }, [domainList]);

  return (
    <>
      <FormikTextField
        autoFocus
        name="maintainer.name"
        label="Maintainer Name"
        formik={formik}
      />
      <FormikTextField
        name="maintainer.email"
        label="Maintainer Email"
        formik={formik}
      />
      <FormikTextField
        name="maintainer.organization"
        label="Maintainer Organization"
        formik={formik}
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className={classes.datePickerContainer}>
          <Field
            component={KeyboardDatePicker}
            data-test="modelFormStartDate"
            format="MM/dd/yyyy"
            label="Model Start Date"
            name="period.gte"
            placeholder="mm/dd/yyyy"
            variant="inline"
          />
          <Field
            format="MM/dd/yyyy"
            component={KeyboardDatePicker}
            data-test="modelFormEndDate"
            label="Model End Date"
            name="period.lte"
            placeholder="mm/dd/yyyy"
            variant="inline"
          />
        </div>
      </MuiPickersUtilsProvider>
      {
        domainList.length > 0
          ? (
            <Autocomplete
              multiple
              filterSelectedOptions
              name="domains"
              value={formik.values.domains || []}
              options={domainList}
              onChange={(evt, value) => { if (value) { formik.setFieldValue('domains', value); } }}
              onBeforeInput={(evt) => {
                if (evt.nativeEvent?.type === 'keypress' && evt.nativeEvent.keyCode === 13) {
                  evt.preventDefault();
                  evt.stopPropagation();
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Model Domain(s)"
                />
              )}
            />
          )
          : (
            <TextField
              disabled
              variant="outlined"
              value="Fetching domains"
              fullWidth
            />
          )
      }
    </>
  );
};

export const ModelDetail = ({
  modelInfo, handleBack, handleNext
}) => {
  const classes = useStyles();
  const formik = useFormik({
    initialValues: modelInfo,
    validationSchema: detailValidationSchema,
    onSubmit: (values) => handleNext(values),
  });

  return (
    <FormikProvider value={formik}>
      <div>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <form onSubmit={formik.handleSubmit}>
          <ModelDetailFields formik={formik} />
          <div className={classes.buttonContainer}>
            <Button
              data-test="modelFormDetailBackBtn"
              onClick={() => handleBack(formik.values)}
            >
              Back
            </Button>
            <Button
              color="primary"
              data-test="modelFormDetailNextBtn"
              type="submit"
              variant="contained"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};
