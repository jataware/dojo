import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import PublishIcon from '@mui/icons-material/Publish';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import axios from 'axios';

import { Input } from '@mui/material';

const useStyles = makeStyles()(() => ({
  buttons: {
    backgroundColor: '#b5d3f0',
    border: '2px solid black',
    color: 'black',
    cursor: 'pointer',
  },
  warningText: {
    color: 'red',
    paddingTop: '16px',
    paddingRight: '8px',
  },
}));

const UploadFileDialog = ({
  open, closeDialog, modelID, uploadPath
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileSizeOverLimit, setfileSizeOverLimit] = useState(false);
  const [filesOverMaxLength, setFilesOverMaxLength] = useState(false);
  const [isClosing, setClosing] = useState(false);

  const FILES_MAX_LENGTH = 5;
  const MAX_FILE_UPLOAD_SIZE = 25 * 1000 * 1000;

  const { classes } = useStyles();

  const uploadFile = (file) => new Promise((resolve) => {
    try {
      axios({
        method: 'POST',
        url: `/api/terminal/container/${modelID}/ops/save?path=${uploadPath}/${file.name}`,
        data: file,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
        .then((response) => {
          resolve(null, response);
        })
        .catch((error) => {
          resolve(error);
          // eslint-disable-next-line no-alert
          alert(`${error} - Please try to upload again. If this continues see dojo documentation on uploading large files using Dojo's Amazon S3 Bucket. https://www.dojo-modeling.com/details/large-files.html`);
        });
    } catch (error) {
      console.log(error);
    }
  });

  const handleSubmit = async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const file of Object.values(selectedFiles)) {
      // eslint-disable-next-line no-await-in-loop
      await uploadFile(file);
    }
    closeDialog();
  };

  const handleFileSelect = (event) => {
    //   Make sure reset every time a file has changed
    setfileSizeOverLimit(false);
    setFilesOverMaxLength(false);

    if (event.target.files.length > FILES_MAX_LENGTH) {
      setFilesOverMaxLength(true);
    }
    Object.values(event.target.files).forEach((file) => {
      if (file.size > MAX_FILE_UPLOAD_SIZE) {
        setfileSizeOverLimit(true);
      }
    });
    setSelectedFiles(event.target.files);
  };

  const handleClose = async (event, reason, shouldClose) => {
    // if we're in the process of closing, don't close the dialog

    if (isClosing) return;

    // only abandon the session if the YES button is clicked, never for any other reason
    if (shouldClose) {
      setClosing(true);
      handleSubmit();
    } else {
      closeDialog();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <PublishIcon style={{ fontSize: '1.0rem', marginRight: '8px' }} />
          Upload Files
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            Select files from your computer.
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <Input type="file" inputProps={{ multiple: true }} onChange={handleFileSelect} />
            {(fileSizeOverLimit || filesOverMaxLength)
              ? (
                <Typography variant="subtitle2" className={classes.warningText}>
                  {fileSizeOverLimit
                    ? (
                      <div>
                        <span className={classes.warningText}>
                          File size over limit - (25mb).
                        </span>
                        <Button
                          href=" https://www.dojo-modeling.com/details/large-files.html"
                          target="_blank"
                          rel="noopener"
                          className={classes.buttons}
                          color="grey"
                        >
                          Documentation - Uploading Large Files
                        </Button>
                      </div>
                    )
                    : ''}
                  <br />
                  {filesOverMaxLength ? `More than ${FILES_MAX_LENGTH} files selected` : '' }
                </Typography>
              )
              : (
                <DialogActions>
                  <Button
                    onClick={(e) => handleClose(e, 'buttonClick', true)}
                    color="primary"
                    disabled={isClosing}
                  >
                    Upload
                  </Button>
                  <Button
                    onClick={() => handleClose(null, 'buttonClick', false)}
                    autoFocus
                    color="secondary"
                    disabled={isClosing}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              )}
          </form>

          {isClosing && (
          <div style={{ height: '20px' }}>
            <LinearProgress color="primary" />
          </div>
          )}
        </DialogContent>

      </Dialog>
    </div>
  );
};

export default UploadFileDialog;
