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
  errorMessage, clearErrorMessage, loading, datasetID
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
  >
    <DialogTitle>
      Upload Data Dictionary File
    </DialogTitle>

    <DialogContent>
       <DialogContentText variant="body2">
         Uploading a .csv or .xlsx file is an alternate method of annotating a dataset's fields. Download the template spreadsheet and include a row describing each field of interest in the dataset. Upload the final file by dropping below, or click on the drop area to use a file picker. Selecting a file will immediately apply the changes and save them.
       </DialogContentText>

      <div style={{display: 'relative'}}>
        <FileDropSelector
          onFileSelect={handleFileSelect}
          onDropFilesRejected={handleDropFilesRejection}
          acceptExtensions={['csv', 'xlsx']}
          CTA="Drop or Select a File"
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

      <Button
        component="a"
        href={`/api/dojo/indicators/annotations/file-template${datasetID ? '?indicator_id='+datasetID : ''}`}
        color="primary">
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

