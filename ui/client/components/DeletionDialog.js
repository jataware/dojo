import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function DeletionDialog({
  itemDescr, deletionHandler, open, handleDialogClose
}) {
  return (
    <Dialog
      open={open}
    >
      <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {itemDescr}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="grey">No</Button>
        <Button
          onClick={(event) => { deletionHandler(event); handleDialogClose(event); }}
          color="grey"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
