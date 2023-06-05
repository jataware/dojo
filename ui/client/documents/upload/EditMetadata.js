import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import startCase from 'lodash/startCase';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import DateFnsUtils from '@date-io/date-fns';

import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

import { KeyboardDatePicker } from 'material-ui-formik-components/KeyboardDatePicker';
import { Formik, Field } from 'formik';
import { ManagedTextField } from './FormFields';

/**
 * Simple helper
 **/
const arrayToDOMOptions = (optionsArray) => optionsArray
  .map(({ value, label }) => (
    <option value={value} key={value}>
      {label}
    </option>
  ));

/**
 *
 **/
export default withStyles((theme) => ({
  root: {
    padding: '1rem',
    paddingRight: 0
  },
  filename: {
    color: theme.palette.primary.main
  }
}))(({
  classes, metadata, filename, onSave
}) => {
  const sharedTextFieldProps = (fieldName) => ({
    name: fieldName,
    label: startCase(fieldName),
    onChange: (value) => onSave(fieldName, value),
    value: metadata[fieldName]
  });

  const sharedSelectFieldProps = (fieldName) => ({
    ...sharedTextFieldProps(fieldName),
    select: true,
    SelectProps: {
      native: true
    }
  });

  const gridItemProps = {
    item: true,
    xs: 12,
    md: 6
  };

  return (
    <div className={classes.root}>
      <Typography
        variant="h5"
        color="textSecondary"
        component="h5"
        paragraph
      >
        Document Metadata for <span className={classes.filename}>{filename}</span>
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ManagedTextField
            required
            placeholder="Document Title"
            {...sharedTextFieldProps('title')}
          />
        </Grid>

        <Grid item xs={12}>
          <ManagedTextField
            placeholder="Provide a description of the Document"
            multiline
            minRows="2"
            {...sharedTextFieldProps('description')}
          />
        </Grid>

        <Grid
          {...gridItemProps}
        >
          <ManagedTextField
            {...sharedTextFieldProps('author')}
          />
        </Grid>

        <Grid
          {...gridItemProps}
        >
          <ManagedTextField
            {...sharedTextFieldProps('publisher')}
          />
        </Grid>

        <Grid
          {...gridItemProps}
        >
          <ManagedTextField
            {...sharedTextFieldProps('producer')}
          />
        </Grid>

        <Grid
          {...gridItemProps}
        >
          <Formik>
            <MuiPickersUtilsProvider
              utils={DateFnsUtils}
            >
              <Field
                style={{
                  marginTop: 0
                }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  style: { borderRadius: 0 },
                }}
                format="MM/dd/yyyy"
                component={KeyboardDatePicker}
                inputVariant="outlined"
                placeholder="mm/dd/yyyy"
                {...sharedTextFieldProps('creation_date')}
              />
            </MuiPickersUtilsProvider>
          </Formik>
        </Grid>

        <Grid
          item
          xs={12}
          style={{ marginTop: 0, paddingTop: 0 }}
        >
          <fieldset style={{ padding: '1rem', width: '100%', border: '1px solid #e9e9e9' }}>

            <legend>Additional Attributes</legend>

            <Grid
              container
              spacing={2}
            >

              <Grid
                {...gridItemProps}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps('original_language')}
                >
                  {arrayToDOMOptions([
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' }
                  ])}
                </ManagedTextField>
              </Grid>

              <Grid
                {...gridItemProps}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps('type')}
                >
                  {arrayToDOMOptions([
                    { value: 'article', label: 'Article' },
                    { value: 'paper', label: 'Paper' }
                  ])}
                </ManagedTextField>
              </Grid>

              <Grid
                {...gridItemProps}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps('stated_genre')}
                >
                  {arrayToDOMOptions([{ value: 'news-article', label: 'News Article' }])}
                </ManagedTextField>
              </Grid>

              <Grid
                {...gridItemProps}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps('classification')}
                >
                  {arrayToDOMOptions([{ value: 'unclassified', label: 'Unclassified' }])}
                </ManagedTextField>
              </Grid>

            </Grid>
          </fieldset>
        </Grid>

      </Grid>

    </div>
  );
});
