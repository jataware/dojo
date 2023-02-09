import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';

import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { PDFDocument } from 'pdf-lib';

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
import ClearIcon from '@material-ui/icons/Clear';
import Alert from '@material-ui/lab/Alert';

import Container from '@material-ui/core/Container';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
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

import { FormAwareTextField, FormAwareSelect } from '../datasets/FormFields';

import { Link as RouteLink } from 'react-router-dom';

import InboxIcon from '@material-ui/icons/MoveToInbox';

import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker } from 'material-ui-formik-components/KeyboardDatePicker';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { pdfMetadataToForm, formatBytes, readFile } from './utils';

const defaultValues = {
  title: "",
  author: "",
  description: "",
  publisher: "",
  producer: "",
  original_language: "en",
  stated_genre: "news-article",
  type: "article",
  classification: "unclassified",
  creation_date: ""
};

// NOTE Metadata format from PDF js lib:
// Author: undefined,
// CreationDate: "Tue Jan 24 2023 15:24:20 GMT-0500 (Eastern Standard Time)",
// Creator: "TeX",
// Keywords: undefined,
// ModificationDate: "Fri Feb 03 2023 13:48:08 GMT-0500 (Eastern Standard Time)",
// PageCount: "8",
// Title: undefined


/**
 *
 **/
export const EditDocumentMetadata = withStyles((theme) => ({
  root: {
    padding: '1rem',
    paddingRight: 0
  },
  formfields: {
  },
  datePickerContainer: {
  }
}))(({ classes, metadata, filename, id, onSave=identity }) => {

  const sharedTextFieldProps = (fieldName) => ({
    name: fieldName,
    label: startCase(fieldName),
    onBlur: (event) => onSave(fieldName, event.target.value)
  });

  const sharedSelectFieldProps = (fieldName) => ({
    name: fieldName,
    label: startCase(fieldName)
    // TODO prob not use Formik
    // onChange: (event) => onSave(fieldName, event.target.value)
  });

  return (
    <div className={classes.root}>
      <Typography
        variant="h5"
        color="textSecondary"
        style={{paddingLeft: "1rem"}}
        gutterBottom
      >
        Metadata Fields for `{filename}`
      </Typography>

      <Formik
        key={id}
        initialValues={metadata}
      >
        {(formik) => (
          <Form>
            <div className={classes.formfields}>

              <List>
                <ListItem>
                  <FormAwareTextField
                    required
                    placeholder="Document Title"
                    {...sharedTextFieldProps("title")}
                  />
                </ListItem>

                <ListItem>
                  <FormAwareTextField
                    placeholder="Provide a description of the Document"
                    multiline
                    minRows="2"
                    {...sharedTextFieldProps("description")}
                  />
                </ListItem>

                <ListItem>
                  <Grid container spacing={2}>

                    <Grid item xs={12} sm={6}>
                      <FormAwareTextField
                        {...sharedTextFieldProps("author")}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormAwareTextField
                        {...sharedTextFieldProps("publisher")}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormAwareTextField
                        {...sharedTextFieldProps("producer")}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Field
                          format="MM/dd/yyyy"
                          component={KeyboardDatePicker}
                          TextFieldComponent={FormAwareTextField}
                          inputVariant="outlined"
                          placeholder="mm/dd/yyyy"
                          {...sharedSelectFieldProps("creation_date")}
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
                          options={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Spanish' }
                          ]}
                          {...sharedSelectFieldProps("original_language")}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          {...sharedSelectFieldProps("type")}
                          options={[
                            { value: 'article', label: 'Article' },
                            { value: 'paper', label: 'Paper' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          {...sharedSelectFieldProps("stated_genre")}
                          options={[
                            { value: 'news-article', label: 'News Article' }
                          ]}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormAwareSelect
                          {...sharedSelectFieldProps("classification")}
                          options={[
                            { value: 'unclassified', label: 'Unclassified' }
                          ]}
                        />
                      </Grid>

                    </Grid>
                  </fieldset>
                </ListItem>

              </List>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  );
});

export const FileDropSelector = withStyles((theme => ({
  root: {
    margin: '2rem 0 1rem 0',
    padding: '2rem',
    borderRadius: '1rem',
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    border: `3px dashed ${theme.palette.grey[200]}`,
  },
  dropActive: {
    borderColor: theme.palette.primary.main,
  },
  dropIcon: {
    width: '7rem',
    height: '7rem',
    padding: '0.5rem'
  }
})))(({classes, onFileSelect}) => {
  // NOTE other params: onDropAccepted/onDropRejected/validator
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop: onFileSelect,
    accept: {
      // NOTE only accepting PDFs for now.
      // Any others?
      'application/pdf': ['.pdf'],
    }
  });

  // TODO lighter color for icon button color on default

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.dropActive]: isDragActive
      })}
      {...getRootProps()}
    >
      <IconButton size="medium" color={isDragActive ? "primary" : "default"}>
        <InboxIcon className={classes.dropIcon}  />
      </IconButton>

      <input {...getInputProps()} /> {/*is hidden*/}

      <Typography variant="h6" color="textSecondary">
        {
          isDragActive ?
            'Drop the files here' :
            'Drag PDFs here. Click to select files.'
        }
      </Typography>
    </div>
  );
});



/**
 *
 **/
export const FileTile = withStyles((theme) => ({
  root: {
    cursor: 'pointer'
  },
  dataGrouping: {
    display: 'flex',
    alignItems: 'center'
  },
  selectedContainer: {
  },
  fileInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  loadingContainer: {
  }
}))(({ classes, file, index, uploadStatus, onClick, selectedIndex }) => {

  // TODO revisit probably. this is aware that onClick receives an index..
  const handleClick = () => {
    // TODO AHA! This is where we could potentially save the existing (previous)
    // Formik values into state....... Think of something better.
    onClick(index);
  };

  return (
    <ListItem
      selected={index === selectedIndex}
      className={classes.root}
      button
      onClick={handleClick}
    >

      <ListItemIcon className={classes.selectedContainer}>
        <Radio value={index+""} disableRipple />
      </ListItemIcon>

      <ListItemText
        primary={file.path}
        secondary={`Size: ${formatBytes(file.size)}`}
      />

      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete">
          <ClearIcon />
        </IconButton>
      </ListItemSecondaryAction>

    </ListItem>
  );
});

/**
 *
 **/
export const SelectedFileList = withStyles((theme) => ({
  root: {
    border: '1px solid #eaeaea',
  },
  list: {
    overflowY: 'auto',
    maxHeight: 650, // TODO rem, maybe px to rem util
  }
}))(({ classes, files, onItemClick, selectedIndex }) => {

  return (
    <Paper
      className={classes.root}
    >
      <RadioGroup
        value={selectedIndex+""}
      >

        <List className={classes.list}>
          {files.map((file, index) =>
            <FileTile
              onClick={onItemClick}
              selectedIndex={selectedIndex}
              index={index}
              file={file}
              key={file.path+file.size}
            />
          )}
        </List>
      </RadioGroup>
    </Paper>
  );
});

const PDF_ATTR_GETTERS = [
  'getTitle', 'getAuthor',
  'getCreator',
  // 'getKeywords',
  // 'getSubject',
  // 'getModificationDate',
  // 'getProducer',
  'getCreationDate', 'getPageCount'
];

/**
 * Uploads a file to the backend service.
 * Receives a form dom reference, datasetId, and optional params.
 * TODO move to common project location, as datasets also uses this..?
 * will need to receive url or so.
 * TODO check why the datasets version needs a ref to the form, instead
 * of a reference to the selected file as we do here.
 **/
export const uploadFile = async (file, documentID, params={}) => {

  const uploadData = new window.FormData();

  uploadData.append('file', file);

  const response = await axios({
    method: 'post',
    url: `/api/dojo/documents/${documentID}/upload`,
    data: uploadData,
    params: params
  });
  return response;
};


/**
 * Submit button is not type=submit for now, since pressing enter
 * causes issues on inconvenient input boxes.
 **/
const UploadDocumentForm = withStyles((theme) => ({
  root: {
    padding: '4rem',
  },
  fileList: {
    display: 'flex',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}))(({ title, children, classes }) => {

  const [files, setFiles] = useState([]);
  const [allPDFMetadata, setAllPDFMetadata] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  console.log('files', files);
  console.log('allPDFMetadata', allPDFMetadata);
  console.log('selectedFileIndex', selectedFileIndex);

  const handleFileSelect = useCallback(acceptedFiles => {

    if (acceptedFiles.length === 0) {
      // TODO
      console.log("Something went wrong. files length is 0");
      // return false;
    }

    const filtered = acceptedFiles
          .filter(i => i.type === 'application/pdf');

    if (filtered.length === 0) {
      // TODO Display to user. Can/Should be handled by DropZone hook instead
      throw new Error('Please select pdf files');
    }

    if (filtered.length !== acceptedFiles.length) {
      // TODO Inform this to the user "set warnings"
      console.log("some files were ignored, as they were not of PDF file type.");
    }

    // gather PDF data. TODO cleanup once e2e prototype is complete
    const pdfData = filtered.map(pdfFile => {
      return readFile(pdfFile)
        .then(binary => {

          return PDFDocument.load(binary)
            .then(pdf => {

              // TODO this bit and pdfMetadataToForm formatting can be done in
              // one go. One reduce, before we handle the promise and reformat
              const acc = {};
              PDF_ATTR_GETTERS.forEach(fun => {

                let val = pdf[fun]();

                if (val) {
                  val = val.toString();
                }

                // Follow above TODO and get rid of this nonsense
                acc[fun.replace('get', '')] = val;
              });

              return acc;
            });
        });
    });

    Promise.all(pdfData)
      .then((allPdfData) => {

        const formattedMetadata = allPdfData.map(pdfMetadataToForm);

        filtered.forEach((file, idx) => {

          return; // TODO remove return. used to skip side effects for now.

          const document = axios({
            method: 'post',
            url: `/api/dojo/documents`,
            data: formattedMetadata[idx],
            params: {}
          }).then(response => {
            const doc = response.data;

            // TODO ? await promise to ensure docs uploaded before leaving
            uploadFile(file, doc.id, {filename: file.name});

          }).catch((e) => {
            console.log('Error creating doc', e);
          });
        });

        // Let's update the state all together when we have everything available.
        // It's hard to trust and coordinate batch updates when performing updates
        // both outside and inside async promise handler:
        setAllPDFMetadata(prevMetadata => [ ...prevMetadata, ...formattedMetadata ]);
        setFiles(prevFiles => [ ...prevFiles, ...filtered ]);
        setSelectedFileIndex(selectedFileIndex => selectedFileIndex || 0);
      });

  }, []);

  /**
   * Trying this experiment now.
   **/
  const handleDocFieldChange = (fieldName, value) => {
    const updatedPDFMetadata = {
      ...allPDFMetadata[selectedFileIndex],
      [fieldName]: value
    };

    const allPDFMetadataClone = [...allPDFMetadata];
    allPDFMetadataClone[selectedFileIndex] = updatedPDFMetadata;

    setAllPDFMetadata(allPDFMetadataClone);
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="lg"
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        style={{paddingBottom: "2rem"}}
      >
        Document Explorer
      </Typography>

      <Typography
        variant="h5"
        color="textSecondary"
        gutterBottom
      >
        Bulk Upload Documents
      </Typography>

      <FileDropSelector onFileSelect={handleFileSelect}/>

      {!isEmpty(files) && (
        <div>

          <br />

          <Typography
            color="textSecondary"
            paragraph
            variant="h6"
          >
            The following files are being uploaded. Confirm or edit
            document metadata fields for each file.
          </Typography>

          <br />

          <div className={classes.fileList}>
            <div style={{flex: '6 1 400px'}}>
              <SelectedFileList
                files={files}
                selectedIndex={selectedFileIndex}
                onItemClick={setSelectedFileIndex}
              />
            </div>

            {selectedFileIndex !== null && (
              <div
                style={{flex: '3 2 600px'}}
              >
                <EditDocumentMetadata
                  onSave={handleDocFieldChange}
                  id={files[selectedFileIndex].name+files[selectedFileIndex].size}
                  filename={files[selectedFileIndex].name}
                  metadata={allPDFMetadata[selectedFileIndex]} />
              </div>
            )}
          </div>

          {/* <div className={classes.navContainer}> */}
          {/*   <Button variant="contained"> */}
          {/*     Cancel */}
          {/*   </Button> */}
          {/*   &nbsp; */}
          {/*   &nbsp; */}
          {/*   <Button */}
          {/*     type="submit" */}
          {/*     color="primary" */}
          {/*     variant="contained" */}
          {/*   > */}
          {/*     Save All */}
          {/*   </Button> */}
          {/* </div> */}

        </div>

      )}

    </Container>
  );
});

export default UploadDocumentForm;
