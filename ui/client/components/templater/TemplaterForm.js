import React, { useEffect } from 'react';

import * as yup from 'yup';
import {
  Field, Form, FormikProvider, useFormik
} from 'formik';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { makeStyles } from 'tss-react/mui';

import ParameterOptions from './ParameterOptions';
import { checkUniqueParameterName } from './templaterUtils';
import { useConfigs, useDirective } from '../SWRHooks';
import FormikTextField from '../formikComponents/FormikTextField';
import FormikSelect from '../formikComponents/FormikSelect';

const useStyles = makeStyles()((theme) => ({
  paramOptionsWrapper: {
    paddingLeft: theme.spacing(2),
  },
  numberField: {
    maxWidth: '200px',
  },
  numberFieldsWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    padding: `4px ${theme.spacing(2)}`,
    width: '100%',
    '& > :first-child': {
      marginRight: theme.spacing(2),
    },
  },
  buttonWrapper: {
    justifyContent: 'space-between',
  },
  predefinedListItem: {
    flexDirection: 'column',
  },
}));

const TemplaterForm = ({
  initialValues,
  handleSubmit,
  setDisableConfirm,
  isMoving,
  setConfirmDeleteDialogOpen,
  modelId,
  currentHighlight,
  highlights,
  content,
  mode,
}) => {
  const { configs } = useConfigs(modelId);
  const { directive } = useDirective(modelId);

  const { classes } = useStyles();

  // This schema is defined inside the component so that we have access to all the arguments
  // for the checkUniqueParameterName function
  const templaterValidationSchema = yup.object({
    name: yup.string().test({
      name: 'unique-name',
      message: ({ value }) => `${value} is used in this or another configuration file.
        Please provide a unique parameter name.`,
      test: (value) => checkUniqueParameterName(
        value, mode, directive, configs, currentHighlight, content, highlights, isMoving
      ),
    }).required('A parameter name is required'),
    description: yup.string().required('A parameter description is required'),
    type: yup.string().required('A parameter type is required'),
    default_value: yup.string(),
    unit: yup.string(),
    unit_description: yup.string(),
    data_type: yup.string().required('A parameter data type is required'),
    predefined: yup.boolean()
      // show the error message when predefined is true but we have zero options in the array
      .when('options', {
        is: (options) => options.length === 0,
        then: yup.bool().oneOf(
          [false], 'At least one option is required with "pre-defined options" selected'
        ),
      }),
    // this is required but will only show up when it exists on the form - when predefined = true
    options: yup.array().of(
      yup.string().min(1)
        .required('Please fill out or remove any blank options before submitting'),
    ),
    min: yup.number().typeError('Must be a number'),
    max: yup.number().typeError('Must be a number'),
  });

  // using useFormik here so we can access the formik instance outside of the JSX wrapper
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => handleSubmit(values),
    validationSchema: templaterValidationSchema,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (formik.dirty) {
      // show the Drawer's confirm dialog on close when the form has been touched
      setDisableConfirm(false);
    }
  }, [formik?.dirty, setDisableConfirm]);

  const toggleOptions = (event) => {
    if (event.target.checked) {
      // add a blank option if we are toggling on the checkbox
      formik.setFieldValue('options', ['']);
    } else {
      // or clear the list if we are toggling it off
      formik.setFieldValue('options', []);
    }
  };

  // with useFormik, we need to wrap the Form in a FormikProvider
  return (
    <FormikProvider value={formik}>
      <Form noValidate onSubmit={formik.handleSubmit}>
        <List dense>
          <ListItem>
            <FormikTextField
              name="name"
              margin="dense"
              label="Name"
              variant="outlined"
              required
              fullWidth
            />
          </ListItem>
          <ListItem>
            <FormikTextField
              name="description"
              margin="dense"
              label="Description"
              variant="outlined"
              required
              multiline
              minRows={2}
              fullWidth
            />
          </ListItem>
          <ListItem>
            <FormikSelect
              name="type"
              margin="dense"
              label="Type"
              variant="outlined"
              fullWidth
              options={[
                { value: 'str', label: 'String / Text' },
                { value: 'int', label: 'Integer / Whole Number' },
                { value: 'float', label: 'Float / Decimal Number' },
                { value: 'datetime', label: 'Date + Time' },
                { value: 'boolean', label: 'Boolean / True or False' },
              ]}
              required
            />
          </ListItem>

          {(formik.values.type === 'float' || formik.values.type === 'int') && (
            <ListItem>
              <div className={classes.numberFieldsWrapper}>
                <FormikTextField
                  className={classes.numberField}
                  name="min"
                  label="min"
                  type="tel"
                  variant="outlined"
                  margin="dense"

                />
                <FormikTextField
                  className={classes.numberField}
                  name="max"
                  label="max"
                  type="tel"
                  variant="outlined"
                  margin="dense"

                />
              </div>
            </ListItem>
          )}

          <ListItem className={classes.predefinedListItem}>
            <Field
              name="predefined"
              label="Users must choose from a list of pre-defined options"
              as={FormControlLabel}
              type="checkbox"
              onClick={(event) => toggleOptions(event, formik)}
              control={<Checkbox />}
            />
            {/* only show the predefined error text if we have the error
              & options have been touched */}
            {Boolean(formik.errors.predefined) && Boolean(formik.touched.options) && (
              <FormHelperText error component="div">
                {formik.errors.predefined}
              </FormHelperText>
            )}

          </ListItem>
          {formik.values.predefined && (
            <ListItem disableGutters className={classes.paramOptionsWrapper}>
              <ParameterOptions formik={formik} options={formik.values.options} />
            </ListItem>
          )}

          <ListItem>
            <FormikTextField
              name="default_value"
              margin="dense"
              label="Default Value"
              variant="outlined"
              fullWidth
            />
          </ListItem>
          <ListItem>
            <FormikTextField
              name="unit"
              margin="dense"
              label="Unit"
              variant="outlined"
              fullWidth
            />
          </ListItem>
          <ListItem>
            <FormikTextField
              name="unit_description"
              margin="dense"
              label="Unit Description"
              variant="outlined"
              fullWidth
            />
          </ListItem>
          <ListItem>
            <FormikSelect
              name="data_type"
              margin="dense"
              label="Data Type"
              variant="outlined"
              fullWidth
              options={[
                { value: 'nominal', label: 'nominal' },
                { value: 'ordinal', label: 'ordinal' },
                { value: 'numerical', label: 'numerical' },
                { value: 'freeform', label: 'freeform' },
              ]}
              required
            />
          </ListItem>
          <ListItem className={classes.buttonWrapper}>
            {/* Add an empty span so that we can easily use justify-content: space-between */}
            {currentHighlight?.annotation ? (
              <Button
                color="secondary"
                onClick={() => setConfirmDeleteDialogOpen(true)}
              >
                Delete Parameter
              </Button>
            ) : <span />}
            <Button
              color="primary"
              variant="contained"
              disableElevation
              type="submit"
              disabled={!formik.dirty && !isMoving}
            >
              Submit
            </Button>
          </ListItem>
        </List>
      </Form>
    </FormikProvider>
  );
};

export default TemplaterForm;
