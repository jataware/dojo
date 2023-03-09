import React, { useState } from 'react';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

export default withStyles((theme) => ({
  loading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
    marginTop: theme.spacing(8),
  },
  selectWrapper: {
    width: '180px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    marginTop: theme.spacing(6),
  },
  textWrapper: {
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.shape.borderRadius,
    padding: [[theme.spacing(4), 0]]
  },
  oldToNew: {
    marginTop: theme.spacing(10),
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 2fr',
  },
  button: {
    minWidth: '160px',
  },
  arrowIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))(({
  classes,
  closeDrawer,
  oldResolution,
  resolutionOptions,
  setSavedResolution,
  savedResolution,
  title,
}) => {
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');

  const handleSaveClick = () => {
    if (selectedResolution !== '') setSavedResolution(selectedResolution);

    closeDrawer();
  };

  const handleChangeResolution = (event) => {
    setSelectedResolution(event.target.value);
  };

  const mainContent = () => {
    // TODO: figure out more failure conditions (or figure out success conditions)
    // TODO: come back to geo - block everything that isn't a string for now
    // oldResolution === 'None' ||
    if (oldResolution === 'None') {
      return (
        <Typography align="center" variant="h6" style={{ marginTop: '64px' }}>
          This dataset does not have a useable {title} resolution
        </Typography>
      );
    }

    // otherwise return the content
    return (
      <>
        <div className={classes.oldToNew}>
          <div className={classes.textWrapper}>
            <Typography variant="h6" align="center">current resolution</Typography>
            <Typography variant="h6" align="center">{oldResolution} km</Typography>
          </div>
          <div className={classes.arrowIcon}>
            <ArrowForwardIcon fontSize="large" />
          </div>
          <div className={classes.textWrapper}>
            <Typography variant="h6" align="center">new resolution</Typography>
            <Typography variant="h6" align="center">
              {selectedResolution} {selectedResolution && 'km'}
            </Typography>
          </div>
        </div>
        <div className={classes.bottomWrapper}>
          <FormControl variant="outlined" className={classes.selectWrapper}>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={selectedResolution}
              onChange={handleChangeResolution}
              label="Resolution"
            >
              {resolutionOptions.map((option) => (
                <MenuItem key={option} value={option}>{option} km</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={handleSaveClick}
            className={classes.button}
          >
            Save Resolution
          </Button>
        </div>
      </>
    );
  };

  return (
    <div>
      <Typography align="center" variant="h5">Adjust {title} Resolution</Typography>
      {oldResolution ? mainContent() : (
        <div className={classes.loading}>
          <Typography variant="subtitle1" align="center">
            Resolution Data Loading
          </Typography>
          <CircularProgress />
        </div>
      )}
    </div>
  );
});