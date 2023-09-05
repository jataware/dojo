import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default ({
  open, title, message, handleClose, maxWidth = 'sm'
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
    maxWidth={maxWidth}
  >
    {title && (
    <DialogTitle>
      {title}
    </DialogTitle>
    )}

    <DialogContent>
      <DialogContentText
        component={typeof message === 'string' ? 'p' : 'div'}
      >
        {message}
      </DialogContentText>
    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Ok
      </Button>
    </DialogActions>
  </Dialog>
);
