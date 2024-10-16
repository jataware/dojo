import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import UpdateIcon from '@mui/icons-material/Update';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  confirmContentText: {
    padding: `0 ${theme.spacing(2)}`,
  },
  actionButton: {
    minWidth: '110px',
    marginLeft: theme.spacing(2),
  },
}));

const DatasetEditDialog = ({
  open, onClose, dataset
}) => {
  const [dialogContent, setDialogContent] = useState('start');
  const dataUrl = 'https://data.wm.dojo-modeling.com/';
  const { classes } = useStyles();

  const redirectToDatasetUrl = (action) => {
    window.location.href = `${dataUrl}?indicator=${dataset?.id}&action=${action}`;
  };

  const handleClose = () => {
    onClose();
    // give this a slight delay so we don't see it flicker as the dialog closes
    setTimeout(() => setDialogContent('start'), 500);
  };

  const renderDialogContent = () => {
    switch (dialogContent) {
      case 'start':
        return (
          <>
            <DialogTitle align="center">
              Ways to edit your dataset
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                component="div"
              >
                <List>
                  <ListItem>
                    <ListItemText
                      primary="
                        Add an additional file without changing existing metadata
                        and annotations.
                      "
                      secondary="
                        Use this if you have a file with additional/new data
                        and the format and annotations haven't changed.
                      "
                      primaryTypographyProps={{ color: 'textPrimary', gutterBottom: true }}
                    />
                    <Button
                      onClick={() => setDialogContent('confirmAppend')}
                      color="primary"
                      variant="contained"
                      disableElevation
                      startIcon={<AddCircleIcon />}
                      className={classes.actionButton}
                    >
                      Add
                    </Button>
                  </ListItem>
                  <Divider component="li" variant="middle" />
                  <ListItem>
                    <ListItemText
                      primary="
                        Update the metadata and annotations without changing the actual data.
                      "
                      secondary="
                        Use this if you need to make any changes to the annotations
                        or information but do not need to upload a new file.
                      "
                      primaryTypographyProps={{ color: 'textPrimary', gutterBottom: true }}
                    />
                    <Button
                      color="primary"
                      variant="contained"
                      component={Link}
                      to={`/datasets/update/register/${dataset?.id}`}
                      disableElevation
                      startIcon={<UpdateIcon />}
                      className={classes.actionButton}
                    >
                      Update
                    </Button>
                  </ListItem>
                </List>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleClose()}
                autoFocus
                color="secondary"
              >
                Cancel
              </Button>
            </DialogActions>
          </>
        );
      case 'confirmAppend':
        return (
          <>
            <DialogTitle align="center">
              Please note the following before appending to your dataset:
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                component="div"
                className={classes.confirmContentText}
              >
                <Typography variant="body1">
                  In order to add another dataset, it must use the same schema as the original
                  annotated dataset. Also, please ensure that you are not uploading data that
                  overlaps with the existing dataset(s), as this will cause duplicates to appear
                  in the results.
                </Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                component={Link}
                to={`/datasets/append/register/${dataset?.id}`}
                disableElevation
                variant="contained"
                color="primary"
                className={classes.actionButton}
              >
                Add Dataset
              </Button>
              <Button
                onClick={() => handleClose()}
                autoFocus
                color="secondary"
              >
                Cancel
              </Button>
            </DialogActions>
          </>

        );
      case 'confirmReplace':
        return (
          <>
            <DialogTitle align="center">
              Please confirm that you want to replace your dataset
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                component="div"
                className={classes.confirmContentText}
              >
                <Typography variant="body1">
                  This will deprecate the old dataset and replace it with new data. You will be
                  able to edit any existing metadata or annotations during the replacement process.
                </Typography>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => redirectToDatasetUrl('replace')}
                disableElevation
                variant="contained"
                color="primary"
                className={classes.actionButton}
              >
                Replace Dataset
              </Button>
              <Button
                onClick={() => handleClose()}
                autoFocus
                color="secondary"
              >
                Cancel
              </Button>
            </DialogActions>
          </>
        );
      default:
        setDialogContent('start');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      {renderDialogContent()}
    </Dialog>
  );
};

export default DatasetEditDialog;
