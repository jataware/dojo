import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import isEmpty from 'lodash/isEmpty';

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

import { pdfMetadataToForm, readFile, uploadFile } from '../utils';
import { FileDropSelector } from './DropArea';
import { SelectedFileList } from './FileList';
import EditMetadata from './EditMetadata';
import PDFViewer from './PDFViewer';


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

  const selectedFile = selectedFileIndex !== null ? files[selectedFileIndex] : {};

  const handleFileSelect = useCallback(acceptedFiles => {

    setLoading(true);

    const byteData = [];

    // gather PDF data. TODO cleanup once e2e prototype is complete
    const pdfData = acceptedFiles.map((pdfFile) => {
      return readFile(pdfFile)
        .then(bytes => {

          // Some side-effects on a map fn...
          const blob = new Blob([ bytes ], {type: "application/pdf"});
          const docUrl = URL.createObjectURL(blob);
          byteData.push(docUrl);

          return PDFDocument.load(bytes)
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
        const formattedFiles = acceptedFiles
              .map((file, idx) => {
                file.blobUrl = byteData[idx];
                return file;
              });

        // Let's update the state all together when we have everything available.
        // It's hard to trust and coordinate batch updates when performing updates
        // both outside and inside async promise handler:
        setAllPDFMetadata(prevMetadata => [ ...prevMetadata, ...formattedMetadata ]);
        setFiles(prevFiles => [ ...prevFiles, ...formattedFiles ]);
        setSelectedFileIndex(selectedFileIndex => selectedFileIndex || 0);
        setLoading(false);
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

  const submitAndUploadDocuments = () => {

    setUploading(true);

    files.forEach((file, idx) => {

      function formatDate(date) {
        return date.toISOString().split('T')[0];
      }

      const metadataClone = {...allPDFMetadata[idx]};

      // TODO do a fn and verify this date load is correct with expected tz etc...
      let creation_date = new Date(metadataClone.creation_date);
      metadataClone.creation_date = formatDate(creation_date);

      const documentsPromise = axios({
        method: 'post',
        url: `/api/dojo/documents`,
        data: metadataClone,
        params: {}
      }).catch((e) => {
        console.log('Error creating doc', e);
      }).then(response => {
        const doc = response.data;

        return uploadFile(file, doc.id, {});

      }).catch((e) => {
        console.log("Error uploading files", e);
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
            <LinearProgress />
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

              <section style={{flex: '4 2 200px', padding: '1rem'}}>
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
              >
                Cancel
              </Button>
              &nbsp;
              <Button
                onClick={submitAndUploadDocuments}
                size="large"
                type="submit"
                color="primary"
                variant="contained"
                disabled={uploading}
              >
                Upload All
              </Button>
            </div>

          </div>

        )}
      </div>

    </Container>
  );
});

export default UploadDocumentForm;
