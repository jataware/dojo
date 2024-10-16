import React from 'react';
import { Form, Formik } from 'formik';
import axios from 'axios';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Container from '@mui/material/Container';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import { Navigation } from '.';
import {
  genRegisterDefaultValues,
  formSchema, BaseData, ContactInformation,
  Resolution, DataQualitySensitivity
} from './metadataComponents';

const skipValidation = false;

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: `${theme.spacing(4)} ${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(4)}`,
  },
  header: {
    marginBottom: theme.spacing(6),
  },
  accordion: {
    margin: '1.5rem 0 2rem 0'
  },
  accordionContent: {
    flexGrow: 0
  }
}));

/**
 * Dataset Update Metadata file landing page (fileMetadata changes only).
 **/
export default ({
  datasetInfo, error, stepTitle, setDatasetInfo,
  handleNext, rawFileName, uploadedFilesData
}) => {
  const fileMetadata = {};
  const { classes } = useStyles();

  const updateDataset = async (validatedData, id) => {
    const payload = {
      id,
      name: validatedData.name,
      description: validatedData.description,
      domains: validatedData.domains,
      maintainer: {
        name: validatedData['registerer-name'],
        email: validatedData['registerer-email'],
        organization: validatedData['source-organization'],
        website: validatedData['source-website'],
      },
      spatial_resolution: validatedData.spatial_resolution,
      temporal_resolution: validatedData.temporal_resolution,
      data_sensitivity: validatedData.data_sensitivity,
      data_quality: validatedData.data_quality
    };

    const response = await axios({
      method: 'PATCH',
      url: `/api/dojo/indicators?indicator_id=${id}`,
      data: payload,
    });
    return response.data;
  };

  const formRef = React.useRef();

  const back = (/* event*/) => {}; // Do nothing

  const defaultValues = genRegisterDefaultValues(datasetInfo);

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
        onSubmit={async (values, { setSubmitting }) => {
          const datasetId = datasetInfo?.id;
          if (!datasetId) {
            throw (new Error('Unable to update metadata for an invalid Dataset.'));
          }

          setSubmitting(true);

          updateDataset(values, datasetId)
            .then(() => {
              handleNext({ dataset: datasetInfo, filename: rawFileName });
            });
        }}
      >
        {(formik) => (
          <Form ref={formRef}>

            <Grid
              container
              spacing={4}
            >
              <Grid item xs={12}>
                <BaseData
                  formik={formik}
                  datasetInfo={datasetInfo}
                  fileMetadata={fileMetadata}
                  setDatasetInfo={setDatasetInfo}
                  error={error}
                  uploadedFilesData={uploadedFilesData}
                />
              </Grid>

              <Grid item xs={12}>
                <ContactInformation />
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
                  <Grid item xs={12}>
                    <DataQualitySensitivity />
                  </Grid>
                </Grid>
              </AccordionDetails>

            </Accordion>

            <Navigation
              handleNext={formik.handleSubmit}
              handleBack={back}
              disabled={Boolean(error)}
            />

          </Form>
        )}
      </Formik>

    </Container>
  );
};
