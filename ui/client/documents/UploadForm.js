
import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';


import { Form, Formik } from 'formik';

import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';


import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Alert from '@material-ui/lab/Alert';

import Container from '@material-ui/core/Container';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';

import Chip from '@material-ui/core/Chip';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';

import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import { Select } from 'material-ui-formik-components/Select';

import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import { Field, getIn, useField } from 'formik';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

import { FileInput } from '../datasets/FileSelector';
import { FormAwareTextField, FormAwareSelect } from '../datasets/FormFields';

import { Link as RouteLink } from 'react-router-dom';


import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from 'material-ui-formik-components/KeyboardDatePicker';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';

const defaultValues = {
  title: "",
  description: "",
  publisher: "",
  file: "",
  producer: "",
  original_language: "en",
  genre: "news-article",
  type: "article",
  classification: "unclassified",
  publication_date: ""
};

/**
 * Submit button is not type=submit for now, since pressing enter
 * causes issues on inconvenient input boxes.
 **/
const UploadDocumentForm = withStyles((theme) => ({
  root: {
    padding: '3rem'
  },
  formfields: {
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    // margin: '0.5rem',
    width: '100%',
    ['& > button']: {
      margin: '0.5rem'
    }
  },
  datePickerContainer: {
  }
}))(({ title, children, classes }) => {
  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="md"
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
      >
        Document Explorer
      </Typography>

      <br />

      <Typography
        variant="h5"
        color="textSecondary"
        style={{paddingLeft: "1rem"}}
        gutterBottom
      >
        Upload New Document
      </Typography>

      <Formik
        initialValues={defaultValues}
        onSubmit={(values, { setSubmitting }) => {
          console.log('values', values);
          return true;
        }}
      >
        {(formik) => (
          <Form>
            <div className={classes.formfields}>

              <List>
                <ListItem>
                  <FormAwareTextField
                    name="title"
                    required
                    label="Title"
                    placeholder="Document Title"
                  />
                </ListItem>

                <ListItem style={{display: 'block'}}>
                  <FileInput
                    name="file"
                    required
                    label="PDF File Upload"
                  />
                </ListItem>

                <ListItem>
                  <FormAwareTextField
                    required
                    name="description"
                    label="Description"
                    placeholder="Provide a description of the Document"
                    multiline
                    minRows="2"
                  />
                </ListItem>

                <ListItem>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormAwareTextField
                        name="publisher"
                        label="Publisher"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormAwareTextField
                        name="producer"
                        label="Producer"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Field
                          format="MM/dd/yyyy"
                          component={KeyboardDatePicker}
                          label="Publication Date"
                          TextFieldComponent={FormAwareTextField}
                          inputVariant="outlined"
                          name="publication_date"
                          placeholder="mm/dd/yyyy"
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>

                  </Grid>
                </ListItem>

                <ListItem>
                  <fieldset style={{padding: "1rem", width: "100%", border: "1px solid #e9e9e9"}}>

                    <legend>Attributes</legend>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          name="original_language"
                          label="Original Language"
                          options={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Spanish' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          name="type"
                          label="Type"
                          options={[
                            { value: 'article', label: 'Article' },
                            { value: 'paper', label: 'Paper' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          name="genre"
                          label="Genre"
                          options={[
                            { value: 'news-article', label: 'News Article' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          name="classification"
                          label="Classification"
                          options={[
                            { value: 'unclassified', label: 'Unclassified' }
                          ]}
                        />
                      </Grid>

                    </Grid>
                  </fieldset>
                </ListItem>

                <ListItem>
                  <div className={classes.navContainer}>
                    <Button variant="contained">
                      Go Back
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                    >
                      Upload
                    </Button>
                  </div>
                </ListItem>
              </List>
            </div>

          </Form>
        )}
      </Formik>

    </Container>
  );
});


export default UploadDocumentForm;

// onClick={formik.handleSubmit}

