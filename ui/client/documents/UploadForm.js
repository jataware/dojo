import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';

import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { PDFDocument } from 'pdf-lib';

import { Formik, Field } from 'formik';

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

/**
 * Special-purpose TextField for this file. It calls onChange on blurring fields,
 * optimizing re-renders. Does not use formik, as the parent controls the value
 * for the selected file.
 **/
const ManagedTextField = ({label, InputProps, inputProps, placeholder, onChange, value, ...props}) => {

  const [internalValue, setInternalValue] = useState("");

  const displayValue = internalValue || value;

  const handleChange = (e) => {
    setInternalValue(event.target.value);
  };

  const handleBlur = () => {
    onChange(internalValue || value);
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      InputLabelProps={{ shrink: true }}
      InputProps={{
        style: { borderRadius: 0 },
        ...InputProps
      }}
      inputProps={{
        'aria-label': label,
        ...inputProps
      }}
      placeholder={placeholder}
      {...props}
      onChange={handleChange}
      onBlur={handleBlur}
      value={displayValue}
    />
  );

};

/**
 * Simple helper
 **/
const arrayToDOMOptions = (optionsArray) => optionsArray
      .map(({value, label}) =>(
        <option value={value} key={value}>
          {label}
        </option>
      ));

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
}))(({ classes, metadata, filename, onSave }) => {

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

      <List>
        <ListItem>
          <ManagedTextField
            required
            placeholder="Document Title"
            {...sharedTextFieldProps("title")}
          />
        </ListItem>

        <ListItem>
          <ManagedTextField
            placeholder="Provide a description of the Document"
            multiline
            minRows="2"
            {...sharedTextFieldProps("description")}
          />
        </ListItem>

        <ListItem>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={6}>
              <ManagedTextField
                {...sharedTextFieldProps("author")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ManagedTextField
                {...sharedTextFieldProps("publisher")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ManagedTextField
                {...sharedTextFieldProps("producer")}
              />
            </Grid>

            <Formik>
              <Grid item xs={12} sm={6}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Field
                    format="MM/dd/yyyy"
                    component={KeyboardDatePicker}
                    inputVariant="outlined"
                    placeholder="mm/dd/yyyy"
                    {...sharedTextFieldProps("creation_date")}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
            </Formik>

          </Grid>
        </ListItem>

        <ListItem>
          <fieldset style={{padding: "1rem", width: "100%", border: "1px solid #e9e9e9"}}>

            <legend>Attributes</legend>

            <Grid container spacing={2}>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps("original_language")}
                >
                  {arrayToDOMOptions([
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' }
                  ])}
                </ManagedTextField>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps("type")}
                >
                  {arrayToDOMOptions([
                    { value: 'article', label: 'Article' },
                    { value: 'paper', label: 'Paper' }
                  ])}
                </ManagedTextField>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps("stated_genre")}
                >
                  {arrayToDOMOptions([{ value: 'news-article', label: 'News Article' }])}
                </ManagedTextField>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
              >
                <ManagedTextField
                  {...sharedSelectFieldProps("classification")}
                >
                  {arrayToDOMOptions([{ value: 'unclassified', label: 'Unclassified' }])}
                </ManagedTextField>
              </Grid>

            </Grid>
          </fieldset>
        </ListItem>

      </List>

    </div>
  );
});

/**
 *
 **/
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
})))(({classes, onFileSelect, onDropFilesRejected}) => {
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDropAccepted: onFileSelect,
    multiple: true,
    onDropRejected: onDropFilesRejected,
    accept: {
      'application/pdf': ['.pdf'],
    }
  });

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
}))(({ classes, file, value, uploadStatus, onClick, selected, onDelete }) => {

  return (
    <ListItem
      selected={selected}
      className={classes.root}
      button
      onClick={onClick}
    >

      <ListItemIcon className={classes.selectedContainer}>
        <Radio value={value} disableRipple />
      </ListItemIcon>

      <ListItemText
        primary={file.path}
        secondary={`Size: ${formatBytes(file.size)}`}
      />

      {/* TODO Add delete icon when we need it, implement handler. */}
      {/* <ListItemSecondaryAction> */}
      {/*   <IconButton edge="end" aria-label="delete" onClick={onDelete}> */}
      {/*     <ClearIcon /> */}
      {/*   </IconButton> */}
      {/* </ListItemSecondaryAction> */}

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
}))(({ classes, files, onItemClick, onDelete, selectedIndex }) => {

  return (
    <Paper
      className={classes.root}
    >
      <RadioGroup
        value={selectedIndex+""}
      >

        <List className={classes.list}>
          {files.map((file, index) => file && (
            <FileTile
              onDelete={() => onDelete(index)}
              selected={index === selectedIndex}
              onClick={() => onItemClick(index)}
              value={index+""}
              file={file}
              key={file.path+file.size}
            />
          ))}
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
    justifyContent: 'space-between'
  }
}))(({ title, children, classes }) => {

  const [files, setFiles] = useState([]);
  const [allPDFMetadata, setAllPDFMetadata] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  console.log('files', files);

  const handleFileSelect = useCallback(acceptedFiles => {

    // TODO add loading animation in case we're parsing many files

    // gather PDF data. TODO cleanup once e2e prototype is complete
    const pdfData = acceptedFiles.map(pdfFile => {
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

        acceptedFiles.forEach((file, idx) => {

          return; // TODO remove. returning to not have side effects
          // TODO dont upload anything until Save / submitted

          function formatDate(date) {
            return date.toISOString().split('T')[0];
          }

          const metadataClone = {...formattedMetadata[idx]};

          // TODO do a fn and verify this date load is correct with expected tz etc...
          let creation_date = new Date(metadataClone.creation_date);
          metadataClone.creation_date = formatDate(creation_date);

          const document = axios({
            method: 'post',
            url: `/api/dojo/documents`,
            data: metadataClone,
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
        setFiles(prevFiles => [ ...prevFiles, ...acceptedFiles ]);
        setSelectedFileIndex(selectedFileIndex => selectedFileIndex || 0);
      });

  }, []);

  /**
   *
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

/**
 * TODO: Either do tomfoolery around deleted indexes, not rendering deleted ones, etc,
 * or change the collection/representation of data from arrays and selected index
 * to an object with key=>properties.
 **/
  const handleFileDelete = (index) => {
    // TODO Implement me
    console.log("deleting file index:", index);
  };

  const handleDropFilesRejection = ({errors, file}, event) => {
    console.log("some file types were rejected. They should be a pdf type.");
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

      <FileDropSelector
        onFileSelect={handleFileSelect}
        onDropFilesRejected={handleDropFilesRejection}
      />

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
                onDelete={handleFileDelete}
                files={files}
                selectedIndex={selectedFileIndex}
                onItemClick={setSelectedFileIndex}
              />
            </div>

            {selectedFileIndex !== null && (
              <div
                style={{flex: '3 2 600px'}}
              >
                {/* NOTE key==selectedIndex renders a form per file, but only for the file in question; */}
                {/*   shorthand for adding a form per file, only displaying selected file form */}
                  <EditDocumentMetadata
                    key={selectedFileIndex}
                    onSave={handleDocFieldChange}
                    filename={files[selectedFileIndex].name}
                    metadata={allPDFMetadata[selectedFileIndex]} />
              </div>
            )}
          </div>

          <br />
          <br />
          <Divider />
          <br />
          <br />

          <div className={classes.navContainer}>
            <Button variant="contained" size="large">
              Cancel
            </Button>
            &nbsp;
            <Button
              size="large"
              type="submit"
              color="primary"
              variant="contained"
            >
              Save All
            </Button>
          </div>

        </div>

      )}

    </Container>
  );
});

export default UploadDocumentForm;
