import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import isEmpty from 'lodash/isEmpty';

/**
 *
 * */
export default ({
  open, warnings = [], errors = [], onAccept, onDecline
}) => (
  <Dialog
    open={open}
  >
    <DialogTitle>
      Please Review
    </DialogTitle>

    <DialogContent>
      <DialogContentText component="div">

        {!isEmpty(warnings) && (
        <>
          <Typography variant="h6">Optional</Typography>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
        )}

        {!isEmpty(errors) && (
        <>
          <Typography variant="h6">Required</Typography>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          <p>
            Annotate required items in order to proceed.
          </p>
        </>
        )}

      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={onDecline}
      >
        Make Changes
      </Button>
      {isEmpty(errors) && (
      <Button
        onClick={onAccept}
        color="primary"
      >
        Continue to Preview
      </Button>
      )}
    </DialogActions>
  </Dialog>
);
