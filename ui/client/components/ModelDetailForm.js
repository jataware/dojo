import React, { useEffect } from 'react';

import * as yup from 'yup';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';

import TextField from '@mui/material/TextField';
import axios from 'axios';
import { makeStyles } from 'tss-react/mui';
import { FormikProvider, useFormik } from 'formik';

import FormikTextField from './FormikTextField';
import FormikDatePicker from './formikComponents/FormikDatePicker';

const useStyles = makeStyles()((theme) => ({
  desc: {
    marginTop: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    '& :first-child': {
      marginRight: theme.spacing(1),
    },
  },
  datePickerContainer: {
    display: 'flex',
    marginBottom: theme.spacing(2),
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

export const DomainsAutocomplete = ({
  formik, label = 'Model Domain(s)', disabled, textFieldProps
}) => {
  const [domainList, setDomainList] = React.useState([]);

  useEffect(() => {
    if (domainList.length === 0) {
      axios('/api/dojo/dojo/domains').then((response) => { setDomainList(response.data); });
    }
  }, [domainList]);

  return domainList.length > 0
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
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={label}
            data-test="modelFormDomain"
            {...textFieldProps}
            disabled={disabled}
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
    );
};

export const ModelDetailFields = ({
  formik
}) => {
  const { classes } = useStyles();

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
      <div className={classes.datePickerContainer}>
        <FormikDatePicker
          data-test="modelFormStartDate"
          format="MM/dd/yyyy"
          label="Model Start Date"
          name="period.gte"
        />
        <FormikDatePicker
          format="MM/dd/yyyy"
          data-test="modelFormEndDate"
          label="Model End Date"
          name="period.lte"
        />
      </div>

      <DomainsAutocomplete formik={formik} />
    </>
  );
};

export const ModelDetail = ({
  modelInfo, handleBack, handleNext
}) => {
  const { classes } = useStyles();
  const formik = useFormik({
    initialValues: modelInfo,
    validationSchema: detailValidationSchema,
    onSubmit: (values) => handleNext(values),
  });

  useEffect(() => {
    // saving the form state every 1 second is probably sufficient
    const debounced = setTimeout(() => {
      localStorage.setItem('modelStep', 1);
      localStorage.setItem('modelInfo', JSON.stringify(formik.values));
    }, 1000);
    return () => clearTimeout(debounced);
  }, [formik]);

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
              color="grey"
            >
              Back
            </Button>
            <Button
              color="primary"
              data-test="modelFormDetailNextBtn"
              type="submit"
              variant="contained"
              disableElevation
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};
