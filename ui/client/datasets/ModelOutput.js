import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';

import isEmpty from 'lodash/isEmpty';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import axios from 'axios';
import Container from '@mui/material/Container';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import * as yup from 'yup';
import get from 'lodash/get';

import { withStyles } from '@mui/material/styles';
import { DomainsAutocomplete } from '../components/ModelDetailForm';

import { Navigation } from '.';
import { FormAwareTextField } from './FormFields';
import { ExtraInput } from './FileSelector';

import { Resolution } from './metadataComponents';

const skipValidation = false;

/**
 * Dataset Registration landing page (fileMetadata, file upload).
 * */

const formSchema = yup.object({
  name: yup
    .string('Enter the Dataset name')
    .required('Please enter Dataset name.'),

  description: yup
    .string('Provide description of the dataset.')
    .required('Please enter a description.'),
});

/**
 * Uses already-defined validation schema to derive if a field is required
 * Used in this file by FormAwareTextField
 * */
const checkRequired = (fieldName) => get(formSchema, `fields.${fieldName}.exclusiveTests.required`, false);

/**
 *
 * */
const Section = withStyles(() => ({
  root: {
  }
}))(({ title, children, classes }) => (
  <section className={classes.root}>
    <Typography
      variant="h6"
      color="textSecondary"
      gutterBottom
    >
      {title}
    </Typography>

    {children}
  </section>
));

/**
 *
 * */
const BaseData = ({
  formik, fileMetadata, setFileMetadata
}) => (
  <Section title="Data Information">
    <FormAwareTextField
      name="name"
      requiredFn={checkRequired}
      label="Name"
      placeholder="Dataset Name"
    />

    <FormAwareTextField
      name="description"
      requiredFn={checkRequired}
      label="Description"
      placeholder="Provide a description of the dataset"
      multiline
      minRows="2"
    />

    <div style={{ margin: '0.5rem 0' }}>
      <DomainsAutocomplete
        formik={formik}
        label="Domains"
        textFieldProps={{
          placeholder: isEmpty(formik.values.domains) ? 'Select as many as appropriate' : '',
          InputLabelProps: { shrink: true }
        }}
      />
    </div>

    <FormAwareTextField
      formik={formik}
      name="filepath"
    />
    <ExtraInput
      formik={formik}
      fileMetadata={fileMetadata}
      setFileMetadata={setFileMetadata}
    />
  </Section>
);

/**
 *
 * */
export default withStyles(({ spacing }) => ({
  root: {
    padding: [[spacing(4), spacing(4), spacing(2), spacing(4)]],
  },
  header: {
    marginBottom: spacing(6),
  },
  accordion: {
    margin: '1.5rem 0 2rem 0'
  },
  accordionContent: {
    flexGrow: 0
  }
}))(({
  classes, datasetInfo, setDatasetInfo, stepTitle, handleNext, handleBack, modelId,
  annotations, setAnnotations, ...props
}) => {
  const [fileMetadata, setFileMetadata] = useState({
    filename: null,
  });
  const [loading, setLoading] = useState(false);

  const back = (/* event*/) => {}; // Do nothing

  // set up the dataset info & basic metadata/annotations objects
  useEffect(() => {
    // Only do this if we aren't already fetching and we haven't loaded the dataset id
    if (!loading && !datasetInfo.id) {
      setLoading(true);
      setDatasetInfo({
        ...datasetInfo,
        id: modelId,

      });
      setAnnotations({
        metadata: fileMetadata,
        annotations: {},
      });

      const terminal_ready_filepath = props.request_path;
      const url = `/api/dojo/job/${modelId}/tasks.model_output_analysis`;
      axios({
        method: 'post',
        url,
        data: {
          model_id: modelId,
          fileurl: terminal_ready_filepath,
          filepath: props?.file_path || '',
          synchronous: true,
          context: {},
        },
      }).then((result) => {
        setLoading(false);
        const jobResult = result.data.result;
        setFileMetadata({
          ...fileMetadata,
          ...jobResult,
          fileurl: terminal_ready_filepath,
          filepath: props?.file_path || '',
        });
      });
    }
  }, [
    datasetInfo,
    fileMetadata,
    modelId,
    props?.file_path,
    props?.request_path,
    setAnnotations,
    setDatasetInfo,
    loading
  ]);

  const defaultValues = {
    name: datasetInfo?.name || '',
    description: datasetInfo?.description || '',
    domains: datasetInfo?.domains || [],
    temporal_resolution: 'annual',
    filepath: props?.file_path,
    'x-resolution': '',
    'y-resolution': '',
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="sm"
    >
      <Typography
        className={classes.header}
        variant="h4"
        align="center"
      >
        {stepTitle}
      </Typography>

      <Formik
        initialValues={defaultValues}
        validationSchema={!skipValidation && formSchema}
        enableReinitialize
        onSubmit={(values) => {
          setAnnotations({
            annotations: annotations.annotations,
            metadata: {
              ...fileMetadata,
              filename: values.filepath,
            }
          });
          setDatasetInfo({
            ...datasetInfo,
            ...values,
          });
          handleNext();
        }}
      >
        {(formik) => (
          <Form>

            <Grid
              container
              spacing={4}
            >
              <Grid item xs={12}>
                <BaseData
                  formik={formik}
                  datasetInfo={datasetInfo}
                  setDatasetInfo={setDatasetInfo}
                  fileMetadata={fileMetadata}
                  setFileMetadata={setFileMetadata}
                />
              </Grid>
            </Grid>

            <Accordion
              square
              variant="outlined"
              className={classes.accordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                classes={{ content: classes.accordionContent }}
              >
                <Typography variant="body2">
                  Resolution, Quality, Sensitivity
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Grid
                  container
                  spacing={4}
                >
                  <Grid item xs={12}>
                    <Resolution />
                  </Grid>
                </Grid>
              </AccordionDetails>

            </Accordion>

            <Navigation
              handleNext={formik.handleSubmit}
              handleBack={back}
            />

          </Form>
        )}
      </Formik>

    </Container>
  );
});
