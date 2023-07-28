import React, { useState } from 'react';

import axios from 'axios';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import { useDirective, useModel } from './SWRHooks';

const useStyles = makeStyles()((theme) => ({
  root: {
    minHeight: '340px',
    minWidth: '500px',
  },
  textArea: {
    width: '100%',
    margin: [[theme.spacing(1), 0]],
  },
  directiveText: {
    backgroundColor: '#445d6e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
  },
  nextIcon: {
    color: 'yellow',
  },
}));

const EndSessionDialog = ({
  open, setOpen, model, afterPublish
}) => {
  const [commitMessage, setCommitMessage] = useState();
  const [published, setPublished] = useState(false);

  const { classes } = useStyles();
  const { directive } = useDirective(model.id);
  const { mutateModel } = useModel(model.id);

  const causemosUrl = `${process.env.CAUSEMOS_UI_URL}/#/model/${model.family_name}/model-publishing-experiment?datacube_id=${model.id}`;

  const handleClose = () => {
    setOpen(false);
  };

  const handleCommitMsg = (event) => {
    setCommitMessage(event.target.value);
  };

  const handlePublishClick = () => {
    axios.post(`/api/dojo/models/${model.id}/publish`, {
      commit_message: commitMessage
    }).then(() => {
      setPublished(true);

      // forcibly set is_published locally to disable the navigate away warning
      mutateModel({ ...model, is_published: true, }, false);
      // call the summary page after publish handler
      afterPublish();
      // register model
      axios.post(`/api/dojo/models/register/${model.id}`).catch((error) => {
        console.log('There was an error registering the model: ', error);
      });
    }).catch((err) => {
      console.log('there was an error publishing the model: ', err);
    });
  };

  if (published) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle id="alert-dialog-title" align="center">
          <Typography variant="h5">Your model was successfully published!</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText align="center">
            View your model on <Link href={causemosUrl}>Causemos</Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      classes={{ paper: classes.root }}
    >
      <DialogTitle id="alert-dialog-title" align="center">
        <Typography variant="h5">Are you ready to publish the model?</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>Execution Directive</Typography>
        <DialogContentText
          id="alert-dialog-description"
          className={classes.directiveText}
        >
          <NavigateNextIcon className={classes.nextIcon} />
          {' '}
          <span>{ directive ? directive.command : 'No directive entered' }</span>
        </DialogContentText>
        <TextField
          className={classes.textArea}
          label="Enter a commit message to describe your changes"
          helperText="Optional"
          minRows={4}
          multiline
          variant="outlined"
          value={commitMessage}
          onChange={handleCommitMsg}
        />
        <Typography variant="body1" gutterBottom>
          Note: after publishing, any changes will require a new version to be created.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          disableElevation
          onClick={handleClose}
          variant="contained"
        >
          No
        </Button>
        <Button
          color="primary"
          disableElevation
          data-test="terminalSubmitConfirmBtn"
          onClick={handlePublishClick}
          variant="contained"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndSessionDialog;
