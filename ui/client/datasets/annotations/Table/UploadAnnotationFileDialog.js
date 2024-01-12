import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

import { FileDropSelector } from '../../../documents/upload/DropArea';

export default ({
  open, handleClose, handleFileSelect,
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
        Download the template spreadsheet and include a row annotating dataset fields.
      </DialogContentText>

      <div style={{ display: 'relative' }}>
        <FileDropSelector
          onFileSelect={handleFileSelect}
          acceptExtensions={['csv', 'xlsx']}
          CTA="Drop or Select a csv, xlsx"
          multiple={false}
          maxFiles={1}
        />
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress
              size={16}
              disableShrink
            />
            &nbsp;
            <span>Uploading</span>
          </div>
        )}
      </div>

      <Button
        component="a"
        href={`/api/dojo/indicators/annotations/file-template${datasetID ? `?indicator_id=${datasetID}` : ''}`}
        color="primary"
      >
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
