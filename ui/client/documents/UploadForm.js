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
import { pdfMetadataToForm } from './utils';

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
}))(({ classes, metadata, filename, id }) => {
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
        onSubmit={(values, { setSubmitting }) => {
          // TODO ... maybe not use Formik?
          // Check their API on reinitializing or saving
          // while changing a specific prop (index, in this case).

          // TODO Maybe `save` on leave the current form, where `onSubmit` is a prop
          // So we would call onSubmit when we need to reinitialize (on index or filename change)
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
                        name="author"
                        label="Author"
                      />
                    </Grid>

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
                          label="Creation Date"
                          TextFieldComponent={FormAwareTextField}
                          inputVariant="outlined"
                          name="creation_date"
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
                          name="stated_genre"
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
    border: `3px dashed ${theme.palette.grey[200]}`

    // TODO stopped working?: begtter dahsed border...
    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='15' ry='15' stroke='${theme.palette.grey[300].replace('#','%23')}' stroke-width='8' stroke-dasharray='6%2c 20' stroke-dashoffset='19' stroke-linecap='square'/%3e%3c/svg%3e")`,
  },
  dropActive: {
    borderColor: theme.palette.primary.main,
    // backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='15' ry='15' stroke='${theme.palette.primary.main.replace('#','%23')}' stroke-width='8' stroke-dasharray='6%2c 20' stroke-dashoffset='19' stroke-linecap='square'/%3e%3c/svg%3e")`,
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

  // console.log("getRootProps", getRootProps());
  // console.log("getInputProps", getInputProps());
  // console.log("isDragActive", isDragActive);

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
 * TODO check if we had this fn in project;
 * TODO move to utils
 **/
function formatBytes(bytes,decimals) {
  if(bytes == 0) return '0 Bytes';
  var k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

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

  console.log("files", files);

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
 * Promise API for reading binary string
 **/
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onabort = reject;
    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

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

    function parseAll() {

      console.log("acceptedFiles", acceptedFiles);

      // acceptedFiles.type === 'application/pdf;
      // acceptedFiles.size = 141843 bytes

      // TODO
      if (acceptedFiles.length === 0) {
        console.log("Something went wrong. files length is 0");
        // return false;
      }

      const filtered = acceptedFiles
            .filter(i => i.type === 'application/pdf');

      if (filtered.length === 0) {
        // TODO Display to user. Can be handled by DropZone hook instead
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

          console.log('raw all pdf data', allPdfData);

          const formattedMetadata = allPdfData.map(pdfMetadataToForm);

          console.log('formatted pdf Metadata', formattedMetadata);

          filtered.forEach((file, idx) => {

            return; // TODO remove. used to skip side effects for now.

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

          setAllPDFMetadata(formattedMetadata);
          setFiles(filtered);
          setSelectedFileIndex(0);
        });
    }

    parseAll();

  }, []);

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
        Upload New Documents
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
                  id={selectedFileIndex+files[selectedFileIndex].name}
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


// onClick={formik.handleSubmit}

// .then(pdfDoc => {

//   window.pdfDoc = pdfDoc;

//   // console.log('Title:', pdfDoc.getTitle())
//   // console.log('Author:', pdfDoc.getAuthor())
//   // console.log('Subject:', pdfDoc.getSubject())
//   // console.log('Creator:', pdfDoc.getCreator())
//   // console.log('Keywords:', pdfDoc.getKeywords())
//   // console.log('Producer:', pdfDoc.getProducer())
//   // console.log('Creation Date:', pdfDoc.getCreationDate())
//   // console.log('Modification Date:', pdfDoc.getModificationDate());

//   // pdfDoc.getPageCount()

//   setEditingMetadata(true);
// });
