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

const aggregationFunctions = [
  'count',
  'size',
  'sum',
  'mean',
  'average',
  'std',
  'var',
  'sem',
  'min',
  'max',
  'first',
  'last',
];

export default withStyles((theme) => ({
  loading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
    marginTop: theme.spacing(8),
  },
  selectWrapper: {
    width: '200px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    marginTop: theme.spacing(6),
    flexWrap: 'wrap',
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
  savedAggregation,
  setSavedAggregation,
  title,
}) => {
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');
  const [selectedAggregation, setSelectedAggregation] = useState(savedAggregation || '');

  // TODO: remove this once we get a list from the backend
  // this is to remove all options below the current time bucket
  let firstOption;
  if (resolutionOptions && oldResolution?.unit) {
    firstOption = resolutionOptions.findIndex((opt) => (
      opt.description.includes(oldResolution.unit)
    ));
  }

  const handleSaveClick = () => {
    if (selectedResolution !== '' && selectedAggregation !== '') {
      setSavedResolution(selectedResolution);
      setSavedAggregation(selectedAggregation);
      closeDrawer();
    }

    // todo: open alert saying must make a selection before saving
    // todo: make this into a form where both selects are required fields
  };

  const handleChangeResolution = (event) => {
    setSelectedResolution(event.target.value);
  };

  const handleChangeAggregation = (event) => {
    setSelectedAggregation(event.target.value);
  };

  return (
    <div>
      <Typography align="center" variant="h5">Adjust {title} Resolution</Typography>
      <div className={classes.oldToNew}>
        <div className={classes.textWrapper}>
          <Typography variant="h6" align="center">current resolution</Typography>
          <Typography variant="h4" align="center">
            {oldResolution.unit.toUpperCase()}
          </Typography>
        </div>
        <div className={classes.arrowIcon}>
          <ArrowForwardIcon fontSize="large" />
        </div>
        <div className={classes.textWrapper}>
          <Typography variant="h6" align="center">new resolution</Typography>
          <Typography variant="h4" align="center">
            {
              selectedResolution.description ? selectedResolution.description.toUpperCase() : ''
            }
          </Typography>
        </div>
      </div>
      <div className={classes.bottomWrapper}>
        {/* TODO: make this into a form with both selects as required before save/submit */}
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel>Aggregation Function</InputLabel>
          <Select
            value={selectedAggregation}
            onChange={handleChangeAggregation}
            label="Aggregation Function"
          >
            {aggregationFunctions.map((funct) => (
              <MenuItem key={funct} value={funct}>{funct}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={selectedResolution}
            onChange={handleChangeResolution}
            label="Resolution"
          >
            {resolutionOptions.slice(firstOption).map((option) => (
              <MenuItem key={option.description} value={option}>
                {option.description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          color="primary"
          variant="contained"
          disableElevation
          onClick={handleSaveClick}
          className={classes.button}
          size="large"
        >
          Save Resolution
        </Button>
      </div>
    </div>
  );
});
