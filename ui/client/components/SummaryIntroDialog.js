import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { useHistory } from 'react-router-dom';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';

import { makeStyles, withStyles } from 'tss-react/mui';

import { BrandName } from './uiComponents/Branding';

const useStyles = makeStyles()((theme) => ({
  versionButtonWrapper: {
    marginTop: theme.spacing(2),
  },
  codeText: {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '4px',
    color: theme.palette.grey[900],
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    margin: `${theme.spacing(2)} 0`,
  },
  containerSelectionDialog: {
    display: 'flex',
    marginTop: theme.spacing(2),
  },
  bigButton: {
    display: 'block',
    flex: '1 1 0',
    height: '92px',
    textTransform: 'none',
  },
  pageLoadDialog: {
    height: 'fit-content',
    width: 'fit-content',
  },
  slideWrapper: {
    // there's a bug in the MUI slide component that causes it to overflow in certain directions
    // https://github.com/mui-org/material-ui/issues/13701
    overflowX: 'hidden',
  },
  confirmInput: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
}));

// This prevents an ugly interior (second) scrollbar from appearing on smaller screens
const DialogContentNoOverflow = withStyles(DialogContent, {
  root: {
    overflow: 'hidden',
  }
});

const SummaryIntroDialog = ({
  open, setOpen, model, summaryLoading, setSummaryLoading
}) => {
  // steps: 'version', 'continue', 'container', 'confirm'
  const defaultStep = model.is_published ? 'version' : 'continue';
  const [step, setStep] = useState(defaultStep);
  const [confirmName, setConfirmName] = useState('');
  const [confirmNameError, setConfirmNameError] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(true);

  const history = useHistory();

  const { classes } = useStyles();
  const theme = useTheme();

  const handleClose = () => {
    // if the summary page is loading, we don't want to be able to close the dialog
    if (summaryLoading) {
      return;
    }

    setOpen(false);
    // switch back to the first screen of the dialog whenever we close it
    // set a timeout equal to the time it takes the dialog to animate away
    // so we don't see a flash back to the version dialog before it closes
    setTimeout(() => setStep(defaultStep), theme.transitions.duration.standard);
  };

  const versionBumpModel = async (event, relaunch) => {
    // prevent the page from redirecting on form submit
    event.preventDefault();
    // set the endpoint for version bumping
    let versionBumpUrl = `/api/dojo/models/version/${model.id}`;
    let provisionUrl;
    let editModelId;

    // and add on the exclude_files flag if we aren't relaunching an image
    if (!relaunch) versionBumpUrl += '?exclude_files=true';

    try {
      // set the loading spinner state on the summary page
      setSummaryLoading(true);

      if (model.is_published) {
        const response = await axios.get(versionBumpUrl);
        editModelId = response.data;
      } else {
        editModelId = model.id;
      }

      // set our endpoint for /provision
      provisionUrl = `/provision/${editModelId}`;

      // and add the relaunch query param if we are relaunching an image
      if (relaunch) provisionUrl += '?relaunch';

      // update the URL without reloading the page, so we don't start the dialog flow over again
      window.history.pushState(null, null, `/summary/${editModelId}`);

      // take us to the /provision page
      history.push(provisionUrl);
    } catch (error) {
      console.log('there was an error version bumping the model', error);
    }
  };

  const handleConfirmName = (event) => {
    setConfirmName(event.target.value);
  };

  useEffect(() => {
    // pseudo debounce to only do this when the user pauses half a second
    const timer = setTimeout(() => {
      if (confirmName.toLowerCase() === model.name.toLowerCase()) {
        // if the value matches, then let them confirm (and disable any errors)
        setConfirmNameError(false);
        setDisableConfirm(false);
      } else if (
        model.name.toLowerCase().substring(0, confirmName.length) === confirmName.toLowerCase()
      ) {
        // if they're typing part of the beginning of the name, disable errors but don't confirm
        setConfirmNameError(false);
        setDisableConfirm(true);
      } else if (confirmName.length) {
        // otherwise, if there is a value and the above aren't true, show an error
        setConfirmNameError(true);
        setDisableConfirm(true);
      } else {
        // or we have no text so we shouldn't show an error
        setConfirmNameError(false);
        setDisableConfirm(true);
      }
    }, 500);

    // clear timer if this gets called again before the timeout is up
    return () => clearTimeout(timer);
  }, [confirmName, model]);

  const displayStep = () => {
    switch (step) {
      case 'version':
        return (
          <div className={classes.pageLoadDialog}>
            <DialogTitle align="center">
              Would you like to create a new model version?
            </DialogTitle>
            <DialogContentNoOverflow>
              <DialogContentText component="div">
                <Typography gutterBottom>
                  Any edits to the existing model&apos;s details, annotations,
                  or output files require creating a new version.
                </Typography>
                <Typography gutterBottom>
                  If you choose not to make a new version, you can run your model in Docker
                  outside <BrandName /> in a terminal (where Docker is running) using the following:
                </Typography>
                <Typography gutterBottom className={classes.codeText}>
                  docker pull {model?.image || '<image_name>'}
                  <br />
                  docker run -it --rm {model?.image || '<image_name>'} /bin/bash
                </Typography>
                <Typography>
                  This will drop you into a shell session where you may interact with your model
                  locally to ensure it was correctly configured. If you find any issues,
                  please create a new model version in <BrandName />.
                </Typography>
              </DialogContentText>
              <DialogActions className={classes.versionButtonWrapper}>
                <Button
                  color="secondary"
                  variant="contained"
                  disableElevation
                  onClick={handleClose}
                >
                  No, view without editing
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    setStep('container');
                  }}
                  endIcon={<ArrowForwardIcon />}
                  data-test="introDialogFirstStepBtn"
                >
                  Create new version
                </Button>
              </DialogActions>
            </DialogContentNoOverflow>
          </div>
        );
      case 'continue':
        return (
          <div className={classes.pageLoadDialog}>
            <DialogTitle align="center">
              Would you like to edit your model?
            </DialogTitle>
            <DialogContentNoOverflow>
              <DialogContentText component="div">
                <Typography gutterBottom>
                  You will be able to launch the terminal and make changes where you left off
                  or start from scratch.
                </Typography>
                <Typography gutterBottom>
                  As the model has not yet been published, any changes will be reflected in
                  this model and not in a new version. If you want to create a new version
                  of your model, be sure to publish this version first.
                </Typography>
                <Typography gutterBottom className={classes.codeText}>
                  docker pull {model?.image || '<image_name>'}
                  <br />
                  docker run -it --rm {model?.image || '<image_name>'} /bin/bash
                </Typography>
                <Typography>
                  This will drop you into a shell session where you may interact with your model
                  locally to ensure it was correctly configured.
                </Typography>
              </DialogContentText>
              <DialogActions className={classes.versionButtonWrapper}>
                <Button
                  color="secondary"
                  variant="contained"
                  disableElevation
                  onClick={handleClose}
                >
                  No, view without editing
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={() => {
                    setStep('container');
                  }}
                  endIcon={<ArrowForwardIcon />}
                  data-test="introDialogFirstStepBtn"
                >
                  Edit model
                </Button>
              </DialogActions>
            </DialogContentNoOverflow>
          </div>
        );
      case 'container':
        return (
          <span className={classes.slideWrapper}>
            <Slide direction="left" in>
              <div className={classes.pageLoadDialog}>
                <DialogTitle align="center">
                  How would you like to run your model?
                </DialogTitle>
                <DialogContentNoOverflow>
                  <DialogContentText component="div">
                    <Typography gutterBottom>
                      Choose whether to:
                    </Typography>
                    <Typography gutterBottom>
                      - START OVER with a base Docker image from the list of images but keep
                      your model metadata.
                      <b>
                        This option will remove all of your existing output,
                        accessory, and configuration files.
                      </b>
                    </Typography>
                    <Typography component="span">
                      - CONTINUE working with your existing model files in the Docker
                      container that you previously created.
                      { !model?.image && (
                        <Typography
                          gutterBottom
                          className={classes.codeText}
                          style={{ margin: 0 }}
                        >
                          Note: As no published image is associated with this model,
                          we are unable to continue where you left off.
                        </Typography>
                      )}
                    </Typography>
                  </DialogContentText>
                  <DialogActions className={classes.containerSelectionDialog}>
                    <Button
                      color="primary"
                      variant="contained"
                      disableElevation
                      className={classes.bigButton}
                      data-test="introDialogStartOverBtn"
                      onClick={(event) => {
                        if (model?.image) {
                          setStep('confirm');
                        } else {
                          versionBumpModel(event);
                        }
                      }}
                    >
                      <Grid container direction="row" justifyContent="center" alignItems="center">
                        <SettingsBackupRestoreIcon fontSize="large" />
                        <Box style={{ marginLeft: '10px' }}>
                          <Typography variant="h5">
                            Start Over
                          </Typography>
                          <Typography variant="subtitle1">
                            from a base image
                          </Typography>
                        </Box>
                      </Grid>
                    </Button>
                    <span>
                      <Typography variant="button">or</Typography>
                    </span>
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      className={classes.bigButton}
                      onClick={(event) => versionBumpModel(event, true)}
                      disabled={!model?.image}
                    >
                      <Grid container direction="row" justifyContent="center" alignItems="center">
                        <PlayArrowIcon fontSize="large" />
                        <Box style={{ marginLeft: '10px' }}>
                          <Typography variant="h5">
                            Continue
                          </Typography>
                          <Typography variant="subtitle1">
                            where you left off
                          </Typography>
                        </Box>
                      </Grid>
                    </Button>
                  </DialogActions>
                </DialogContentNoOverflow>
              </div>
            </Slide>
          </span>
        );
      case 'confirm':
        return (
          <div>
            <DialogTitle align="center">
              Are you sure you want to start over from a base image?
            </DialogTitle>
            <DialogContentNoOverflow>
              <DialogContentText component="div">
                <Typography>
                  Starting over from a base image will remove your existing output, accessory,
                  and configuration files. Please confirm that this is what you would like to do.
                </Typography>
              </DialogContentText>
              <Typography variant="subtitle1" gutterBottom className={classes.codeText}>
                Model Name: {model.name}
              </Typography>

              <form>
                <TextField
                  autoFocus
                  value={confirmName}
                  onChange={handleConfirmName}
                  label="Please re-enter your model name to confirm that you want to start over"
                  className={classes.confirmInput}
                  variant="outlined"
                  error={confirmNameError}
                  helperText={confirmNameError ? 'Please enter your exact model name (case insensitive)' : ' '}
                  data-test="introDialogConfirmNameField"
                />
                <DialogActions>
                  <Button
                    color="secondary"
                    variant="contained"
                    disableElevation
                    onClick={() => setStep('container')}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disableElevation
                    disabled={disableConfirm}
                    onClick={(event) => versionBumpModel(event)}
                    data-test="introDialogConfirmNameBtn"
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </form>
            </DialogContentNoOverflow>
          </div>
        );
      default:
        return (
          <>
            <DialogTitle align="center">There was an error</DialogTitle>
            <DialogContentNoOverflow>
              <DialogContentText>Please reload the page</DialogContentText>
            </DialogContentNoOverflow>
          </>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      {displayStep()}
    </Dialog>
  );
};

export default SummaryIntroDialog;
