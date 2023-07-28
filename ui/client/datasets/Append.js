import React, { useState } from 'react';
import { Form, Formik } from 'formik';

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
  uploadFile,
  updateMetadata, genRegisterDefaultValues,
  formSchema, BaseData, ContactInformation,
  Resolution, DataQualitySensitivity
} from './metadataComponents';

const skipValidation = false;

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: [[theme.spacing(4), theme.spacing(4), theme.spacing(2), theme.spacing(4)]],
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
 * Dataset Append file landing page (fileMetadata, file upload).
 **/

/**
 *
 * */
export default ({
  datasetInfo, error, stepTitle, setDatasetInfo,
  setAnnotations, handleNext, rawFileName, uploadedFilesData,
}) => {
  const [fileMetadata, setFileMetadata] = useState({});
  const { classes } = useStyles();

  const formRef = React.useRef();

  const back = (/* event*/) => {}; // Do nothing

  const defaultValues = genRegisterDefaultValues(datasetInfo);
  const [isUpdatingUploadedFile, setUpdatingUploadedFile] = useState(false);

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
          setSubmitting(true);

          const isFileUploaded = datasetInfo.fileData?.raw?.uploaded;
          let rawFileNameToUse = rawFileName;

          if (!isFileUploaded || isUpdatingUploadedFile) {
            const uploadResponse = await uploadFile(
              formRef.current,
              datasetInfo.id,
              { append: true, filename: rawFileName }
            );

            rawFileNameToUse = uploadResponse.data.filename;

            const fileMetadataData = { ...fileMetadata, rawFileName: rawFileNameToUse };

            await updateMetadata(datasetInfo.id, fileMetadataData, setAnnotations);
          }

          handleNext({ dataset: datasetInfo, filename: rawFileNameToUse });
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
                  setDatasetInfo={setDatasetInfo}
                  fileMetadata={fileMetadata}
                  setFileMetadata={setFileMetadata}
                  error={error}
                  isUpdatingUploadedFile={isUpdatingUploadedFile}
                  setUpdatingUploadedFile={setUpdatingUploadedFile}
                  uploadedFilesData={uploadedFilesData}
                  isReadOnlyMode
                />
              </Grid>

              <Grid item xs={12}>
                <ContactInformation isReadOnlyMode />
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
                    <Resolution isReadOnlyMode />
                  </Grid>
                  <Grid item xs={12}>
                    <DataQualitySensitivity isReadOnlyMode />
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
