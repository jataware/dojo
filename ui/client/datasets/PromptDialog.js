import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function formatCode(text) {
  // TODO send better formatted message from parent, or relevant keys
  // so that we may pretty print this message without json
  return JSON.stringify(text, null, 2);
}

export default ({
  open, title, message, handleClose
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
  >
    <DialogTitle>
      {title}
    </DialogTitle>
    <DialogContent>
      {typeof message === 'object' ?
       (<pre>{formatCode(message)}</pre>)
       :
       <DialogContentText>
         {message}
       </DialogContentText>
      }
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Ok
      </Button>
    </DialogActions>
  </Dialog>
);
