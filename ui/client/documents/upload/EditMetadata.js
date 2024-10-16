import React from 'react';

import startCase from 'lodash/startCase';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { makeStyles } from 'tss-react/mui';

import { ManagedTextField } from './FormFields';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: '1rem',
    paddingRight: 0
  },
  filename: {
    color: theme.palette.primary.main
  }
}));

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
export default ({
  metadata, filename, onSave
}) => {
  const { classes } = useStyles();

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
          <DatePicker
            sx={{ width: '100%' }}
            slotProps={{ textField: { InputProps: { style: { borderRadius: 0 } } } }}
            {...sharedTextFieldProps('creation_date')}
          />
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
};
