import React from 'react';

import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

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
