import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import snakeCase from 'lodash/snakeCase';

import { PDFDocument } from 'pdf-lib';

// import ClearIcon from '@material-ui/icons/Clear';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
// import get from 'lodash/get';

import { readFile } from '../utils';

import { uploadFile } from '../../utils';

import { FileDropSelector } from './DropArea';
import { SelectedFileList } from './FileList';
import EditMetadata from './EditMetadata';
import PDFViewer from './PDFViewer';


const PDF_ATTR_GETTERS = [
  'getTitle',
  'getAuthor',
  'getCreator',
  'getCreationDate',
  'getPageCount'
];

const defaultValues = {
  title: '',
  author: '',
  description: '',
  publisher: '',
  producer: '',
  original_language: 'en',
  stated_genre: 'news-article',
  type: 'article',
  classification: 'unclassified',
  creation_date: ''
};

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getFormattedPDFMetadata(pdfDoc) {
  return PDF_ATTR_GETTERS.reduce(
    (acc, pdfLibAttr) => {
      let propertyValue = pdfDoc[pdfLibAttr]();

      if (propertyValue === undefined) {
        return acc;
      }

      let key = pdfLibAttr.replace('get', '');
      key = snakeCase(key);

      if (key === 'page_count') {
        key = 'pages';
      }

      acc[key] = propertyValue;

      return acc;

    },
    {...defaultValues});
}

const CustomLoading = withStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'inline'
  },
  bottom: {
    color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  top: {
    color: '#1a90ff',
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
  circle: {
    strokeLinecap: 'round',
  }
}))(({classes, ...props}) => {
  return (
    <div className={classes.root}>
      <CircularProgress
        variant="determinate"
        className={classes.bottom}
        size={30}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        className={classes.top}
        classes={{
          circle: classes.circle,
        }}
        size={30}
        thickness={4}
        {...props}
      />
    </div>
  );
});

/**
 * Submit button is not type=submit for now, since pressing enter
 * causes issues on inconvenient input boxes.
 **/
const UploadDocumentForm = withStyles((theme) => ({
  root: {
    padding: '3rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    width: "100%",
    flex: "1 1 auto",
    margin: "auto",
    display: 'flex',
    flexDirection: 'column'
  },
  fileList: {
    display: 'flex',
    height: '100%'
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem'
  }
}))(({ title, children, classes }) => {

  const [files, setFiles] = useState([]);
  const [allPDFMetadata, setAllPDFMetadata] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [acceptedFilesCount, setAcceptedFilesCount] = useState(0);
  const [acceptedFilesParsed, setAcceptedFilesParsed] = useState(0);

  const selectedFile = selectedFileIndex !== null ? files[selectedFileIndex] : {};

  const history = useHistory();

  const handleFileSelect = (acceptedFiles) => {

    setLoading(true);
    setAcceptedFilesCount(current => acceptedFiles.length + current);

    const byteData = {};

    const pdfData = acceptedFiles.map((pdfFile) => {
      return readFile(pdfFile)
        .then(bytes => {
          // Some side-effects on a map fn...
          const blob = new Blob([ bytes ], {type: "application/pdf"});
          const docUrl = URL.createObjectURL(blob);
          byteData[pdfFile.path] = docUrl;

          return PDFDocument.load(bytes)
            .then(pdf => {
              setAcceptedFilesParsed(current => current + 1);
              return pdf;
            })
            .then(pdf => getFormattedPDFMetadata(pdf));
        });
    });

    Promise.all(pdfData)
      .then((allPdfData) => {
        const formattedFiles = acceptedFiles
          .map((file) => {
            // eslint-disable-next-line no-param-reassign
            file.blobUrl = byteData[file.path];
            return file;
          });

        // Let's update the state all together when we have everything available.
        // It's hard to trust and coordinate batch updates when performing updates
        // both outside and inside async promise handler:
        setAllPDFMetadata(prevMetadata => [ ...prevMetadata, ...allPdfData ]);
        setFiles(prevFiles => [ ...prevFiles, ...formattedFiles ]);
        setSelectedFileIndex(selectedFileIndex => selectedFileIndex || 0);

        setLoading(false);

        setAcceptedFilesCount(0);
        setAcceptedFilesParsed(0);
      });

  };

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

  const submitAndUploadDocuments = () => {

    setUploading(true);

    files.forEach((file, idx) => {

      // We use the parsed doc Date object type until the very last minute
      // so that the UI calendar widget can work properly, and then we
      // format for the server before submitting.
      const metadataClone = {...allPDFMetadata[idx]};
      metadataClone.creation_date = formatDate(metadataClone.creation_date);

      const documentsPromise = axios({
        method: 'post',
        url: `/api/dojo/documents`,
        data: metadataClone,
        params: {}
      }).catch((e) => {
        console.log('Error creating doc', e);
      }).then(response => {
        const doc = response.data;
        return uploadFile(file, `/api/dojo/documents/${doc.id}/upload`, {});
      }).catch((e) => {
        console.log("Error uploading files", e);
      }).then(() => {
        history.push('/documents');
      });

      // if we map files to promises to await all uploads:
      // return documentsPromise;

    });
  };

  /**
   * TODO: In order to handle deletes- either do backflips around deleted indexes,
   * not rendering deleted ones, etc, or change the collection/representation
   * of data from arrays and selected index to an object with key=>properties.
   **/
  const handleFileDelete = (index) => {
    // TODO Implement me once we use SortedMap
    console.log("deleting file index:", index);
  };

  const handleDropFilesRejection = ({errors, file}, event) => {
    console.log("some file types were rejected. They should be a pdf type.");
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth={selectedFileIndex === null ? "md" : false}
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
      >
        Document Explorer
      </Typography>

      <Typography
        variant="h5"
        color="textSecondary"
        gutterBottom
      >
        Bulk Document Upload
      </Typography>

      <div className={classes.mainContent}>
        <Alert
          style={{border: "none"}}
          severity="info"
          variant="outlined"
        >
          Drag and Drop files and folders on the drop zone below. Nested directories are supported.
        </Alert>

        <FileDropSelector
          onFileSelect={handleFileSelect}
          onDropFilesRejected={handleDropFilesRejection}
        />

        {loading && (
          <div>
            <br />
            <div style={{display: 'flex', alignItems: 'center'}}>
              <CustomLoading
                variant="determinate"
                value={(acceptedFilesParsed / acceptedFilesCount) * 100}
              />
              &nbsp;
              <span>
                Processing: {acceptedFilesParsed} / {acceptedFilesCount} files.
              </span>
            </div>
            <br />
          </div>
        )}

        {!isEmpty(files) && (
          <div style={{
            flex: '3 0 auto'
          }}>

            <Alert
              style={{border: "none", paddingTop: '0.5rem'}}
              severity="info"
              variant="outlined"
            >
              The following {files.length > 1 ? `${files.length} files` : "file"} will be uploaded. Confirm or edit
              document metadata fields before proceeding.
            </Alert>

            <div className={classes.fileList}>

              <section style={{flex: '4 2 400px', padding: '1rem'}}>
                <SelectedFileList
                  onDelete={handleFileDelete}
                  files={files}
                  selectedIndex={selectedFileIndex}
                  onItemClick={setSelectedFileIndex}
                />
              </section>

              {selectedFileIndex !== null && (
                <section style={{flex: '6 2 400px'}}>
                  <PDFViewer
                    file={selectedFile}
                  />
                </section>
              )}

              {selectedFileIndex !== null && (
                <section
                  style={{flex: '4 1 500px'}}
                >
                  {/* NOTE key==selectedIndex renders a form per file, but only for the file in question; */}
                  {/*   shorthand for adding a form per file, only displaying selected file form */}
                  <EditMetadata
                    key={selectedFileIndex}
                    onSave={handleDocFieldChange}
                    filename={selectedFile.name}
                    metadata={allPDFMetadata[selectedFileIndex]} />
                </section>
              )}

            </div>

            <div className={classes.navContainer}>
              <Button
                variant="contained"
                size="large"
                disabled={uploading}
              >
                Cancel
              </Button>
              &nbsp;
              {uploading ? (
                <div>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <CustomLoading
                      variant="indeterminate"
                    />
                    &nbsp;
                    <span>
                      Uploading All
                    </span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={submitAndUploadDocuments}
                  size="large"
                  type="submit"
                  color="primary"
                  variant="contained"
                >
                  Upload All
                </Button>

              )}
            </div>

          </div>

        )}
      </div>

    </Container>
  );
});

export default UploadDocumentForm;
