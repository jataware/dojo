import React, { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { makeStyles } from '@mui/material/styles';

import ConfirmDialog from './ConfirmDialog';

const useStyles = makeStyles((theme) => ({
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  container: {
    display: 'flex',
    flex: 1,
  },
}));

/* eslint-disable-next-line react/jsx-props-no-spreading */
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const FullScreenDialog = ({
  open, setOpen, onSave, children, title, showSave, noConfirm, denseToolbar, ...props
}) => {
  const saveVisible = showSave !== false;
  const [openConfirmCloseDialog, setOpenConfirmCloseDialog] = useState(false);
  const classes = useStyles();
  const handleClose = () => {
    if (noConfirm) {
      setOpen(false);
      return;
    }

    setOpenConfirmCloseDialog(true);
  };
  const handleAbandonSession = () => {
    // TODO maybe add a processing spinner while teardown is occuring
    setOpenConfirmCloseDialog(false);
    setOpen(false);
  };

  const handleSave = () => {
    // let the onSave() handler decide whether we close this FullScreenDialog window
    const shouldClose = onSave();
    setOpen(!shouldClose);
  };

  return (
    <div>
      <Dialog
        disableEscapeKeyDown
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        {...props}
      >
        <AppBar position="sticky">
          <Toolbar variant={denseToolbar ? 'dense' : 'regular'}>
            <IconButton
              aria-label="close"
              color="inherit"
              data-test="fullScreenDialogCloseBtn"
              edge="start"
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              {title || ''}
            </Typography>
            <Button
              autoFocus
              color="inherit"
              data-test="fullScreenDialogSaveBtn"
              onClick={handleSave}
              style={{ display: saveVisible ? 'unset' : 'none' }}
            >
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Box className={classes.container}>
          {children}
        </Box>
      </Dialog>
      { openConfirmCloseDialog && (
      <ConfirmDialog
        open={openConfirmCloseDialog}
        accept={handleAbandonSession}
        reject={() => { setOpenConfirmCloseDialog(false); }}
        title="Are you sure you want to leave without saving?"
        body="Any unsaved changes will be lost."
      />
      )}
    </div>
  );
};

export default FullScreenDialog;
