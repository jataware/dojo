import React, { useState } from 'react';

import { makeStyles } from 'tss-react/mui';

import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import ConfirmDialog from './ConfirmDialog';

const useStyles = makeStyles()((theme) => {
  const baseRoot = {
    minWidth: '20rem',
    padding: `${theme.mixins.toolbar.minHeight}px ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`,
    marginTop: theme.spacing(1),
  };

  return {
    root: {
      width: '30%',
      ...baseRoot,
    },
    wideRoot: {
      width: '40%',
      ...baseRoot,
    },
    drawerControls: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
  };
});

export default ({
  anchorPosition,
  children,
  confirmBody = 'Please confirm that you want to discard your changes.',
  confirmTitle = 'Are you sure you want to discard your work?',
  onClose,
  open,
  variant = 'persistent',
  noConfirm = false,
  wide,
  ...props
}) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const { classes } = useStyles();

  const handleClose = (event) => {
    if (noConfirm) {
      // if we don't want a confirm dialog, don't prevent clicking outside to close
      // and just call our onClose function right away
      onClose(true, event);
      return;
    }
    // disable clicking outside the drawer to close for variant=temporary
    // instead relying on the close or X buttons (or noConfirm prop, as above)
    if (event.target.className === 'MuiBackdrop-root') {
      // MuiBackdrop-root only appears in the background for variant = temporary
      return;
    }

    setConfirmClose(true);
  };

  const handleConfirmedClose = () => {
    setConfirmClose(false);
    onClose(true);
  };

  return (
    <>
      <Drawer
        variant={variant}
        classes={{ paper: wide ? classes.wideRoot : classes.root }}
        anchor={anchorPosition}
        open={open}
        onClose={handleClose}
        style={{ width: wide ? '40%' : '30%' }}
        {...props}
      >
        <>
          <div className={classes.drawerControls}>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </div>
          {children}
        </>
      </Drawer>

      {/* unmount the dialog so we reset its state entirely
      otherwise it can get into a closing state if opened again */}
      {confirmClose && (
      <ConfirmDialog
        accept={handleConfirmedClose}
        body={confirmBody}
        open={confirmClose}
        reject={() => setConfirmClose(false)}
        title={confirmTitle}
      />
      )}
    </>
  );
};
