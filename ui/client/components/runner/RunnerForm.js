import React from 'react';

import {
  Form, FormikProvider, useFormik
} from 'formik';

import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import RunnerParameter from './RunnerParameter';
import { RunCreationSchema, getRunDefaults } from './runnerTools';

const RunnerForm = ({
  handleSubmit,
  parameters,
}) => {
  const formik = useFormik({
    initialValues: getRunDefaults(parameters),
    onSubmit: (values) => handleSubmit(values),
    validationSchema: RunCreationSchema(parameters),
    enableReinitialize: true,
  });

  return (
    <FormikProvider value={formik}>
      <Form noValidate onSubmit={formik.handleSubmit}>
        <List dense>
          {parameters.map((param) => RunnerParameter(param.annotation))}
          <ListItem>
            <Button
              color="primary"
              variant="outlined"
              disableElevation
              type="submit"
            >
              Submit Model Run
            </Button>
          </ListItem>
        </List>
      </Form>
    </FormikProvider>
  );
};

export default RunnerForm;
