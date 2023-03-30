import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import get from 'lodash/get';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import Typography from '@material-ui/core/Typography';

import { FileDropSelector } from '../../../documents/upload/DropArea';

export default ({
  open, handleClose, handleFileSelect, handleDropFilesRejection,
  onDownload, errorMessage, clearErrorMessage, loading
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
  >
    <DialogTitle>
      Upload Annotations File
    </DialogTitle>

    <DialogContent>
       <DialogContentText variant="body2">
         Uploading a CSV file is an alternate method of annotating a dataset's fields. Download the CSV template and include a row describing each field of interest in the dataset. Upload final file by dropping below, or click on the drop area to use a file picker.
       </DialogContentText>

      <div style={{display: 'relative'}}>
        <FileDropSelector
          onFileSelect={handleFileSelect}
          onDropFilesRejected={handleDropFilesRejection}
          acceptExtensions={['csv']}
          CTA="Upload Annotations CSV"
          multiple={false}
        />
        {loading && (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <CircularProgress
                size={16}
                disableShrink
              /> &nbsp; <span>Uploading</span>
          </div>
        )}
      </div>

      <Button onClick={onDownload} color="primary">
        Download template
      </Button>

      {errorMessage && (
        <Alert
          severity="error"
          onClose={clearErrorMessage}
        >
          {errorMessage}
        </Alert>
      )}

    </DialogContent>

    <DialogActions>
      <Button
        onClick={handleClose}
        color="secondary"
      >
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

