import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import get from 'lodash/get';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Typography from '@material-ui/core/Typography';

import { FileDropSelector } from '../../../documents/upload/DropArea';

export default ({
  open, handleClose, handleFileSelect, handleDropFilesRejection, onDownload
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
  >
    <DialogTitle>
      Upload Annotations File
    </DialogTitle>

    <DialogContent>
       <DialogContentText>
         Uploading a CSV file is an alternate method of annotating a dataset's fields. Download the CSV template and include a row describing each field of interest in the dataset.
       </DialogContentText>

      <FileDropSelector
        onFileSelect={handleFileSelect}
        onDropFilesRejected={handleDropFilesRejection}
        acceptExtensions={['csv']}
        CTA="Upload Annotations CSV"
      />

      <Button onClick={onDownload} color="primary">
        Download template
      </Button>

    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
);

