import React, { useCallback, useState } from 'react';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import PreviewTransformation from './PreviewTransformation';
import { generateProcessTempResArgs } from './dataTransformationHelpers';

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
  selectWrapper: {
    width: '200px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    margin: [[theme.spacing(6), 0, theme.spacing(10)]],
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
    height: '56px',
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
  jobString,
  datasetId,
  annotations,
  cleanupRef,
}) => {
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');
  const [selectedAggregation, setSelectedAggregation] = useState(savedAggregation || '');
  const [saveAttempt, setSaveAttempt] = useState(false);

  // TODO: remove this once we get a list from the backend
  // this is to remove all options below the current time bucket
  let firstOption;
  if (resolutionOptions && oldResolution?.unit) {
    firstOption = resolutionOptions.findIndex((opt) => (
      opt.description.includes(oldResolution.unit)
    ));
  }

  const handleSaveClick = () => {
    // toggle saveAttempt to show our errors if either select hasn't been chosen
    setSaveAttempt(true);
    if (selectedResolution !== '' && selectedAggregation !== '') {
      setSavedResolution(selectedResolution);
      setSavedAggregation(selectedAggregation);
      closeDrawer();
    }
  };

  const handleChangeResolution = (event) => {
    setSelectedResolution(event.target.value);
  };

  const handleChangeAggregation = (event) => {
    setSelectedAggregation(event.target.value);
  };

  const createPreviewArgs = useCallback((argsAnnotations) => {
    const args = generateProcessTempResArgs(
      argsAnnotations, selectedResolution, selectedAggregation
    );
    args.preview_run = true;
    return args;
  }, [selectedResolution, selectedAggregation]);

  return (
    <div>
      <Typography align="center" variant="h5">Adjust Temporal Resolution</Typography>
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
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel error={saveAttempt && !selectedAggregation}>
            Aggregation Function
          </InputLabel>
          <Select
            value={selectedAggregation}
            onChange={handleChangeAggregation}
            label="Aggregation Function"
            error={saveAttempt && !selectedAggregation}
          >
            {aggregationFunctions.map((funct) => (
              <MenuItem key={funct} value={funct}>{funct}</MenuItem>
            ))}
          </Select>
          {saveAttempt && !selectedAggregation && (
            <FormHelperText error={saveAttempt && !selectedAggregation}>
              Please select an aggregation function
            </FormHelperText>
          )}
        </FormControl>
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel error={saveAttempt && !selectedResolution}>
            Resolution
          </InputLabel>
          <Select
            value={selectedResolution}
            onChange={handleChangeResolution}
            label="Resolution"
            error={saveAttempt && !selectedResolution}
          >
            {resolutionOptions.slice(firstOption).map((option) => (
              <MenuItem key={option.description} value={option}>
                {option.description}
              </MenuItem>
            ))}
          </Select>
          {saveAttempt && !selectedResolution && (
            <FormHelperText error={saveAttempt && !selectedResolution}>
              Please select a resolution
            </FormHelperText>
          )}
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
      <PreviewTransformation
        jobString={jobString}
        datasetId={datasetId}
        annotations={annotations}
        cleanupRef={cleanupRef}
        createPreviewArgs={createPreviewArgs}
        disabled={!selectedAggregation || !selectedResolution.alias}
      />
    </div>
  );
});
