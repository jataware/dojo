import React, { useCallback, useState } from 'react';

import isFinite from 'lodash/isFinite';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import PreviewTransformation from './PreviewTransformation';
import { generateProcessGeoResArgs } from './dataTransformationHelpers';

export default withStyles((theme) => ({
  selectWrapper: {
    width: '180px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    margin: [[theme.spacing(6), 0]],
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
  jobString,
  datasetId,
  annotations,
  cleanupRef,
}) => {
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');
  const [error, setError] = useState(false);

  const nonUniform = oldResolution === 'Non-uniform/event data';

  const handleSaveClick = () => {
    if (selectedResolution !== '') setSavedResolution(selectedResolution);

    closeDrawer();
  };

  const handleChangeResolution = (event) => {
    setSelectedResolution(Number(event.target.value));

    if (nonUniform) {
      // When we have the text input, validate that it's a number
      if (event.target.value === '' || !isFinite(Number(event.target.value))) {
        setError(true);
      } else {
        setError(false);
      }
    }
  };

  const createPreviewArgs = useCallback((argsAnnotations) => {
    const args = generateProcessGeoResArgs(argsAnnotations, selectedResolution, oldResolution);
    args.preview_run = true;
    return args;
  }, [selectedResolution, oldResolution]);

  const formatNewResolution = () => {
    if (!selectedResolution || selectedResolution === '') return '';
    if (nonUniform) return `${selectedResolution} km`;
    return `${selectedResolution.toFixed(2)} km`;
  };

  const switchInput = () => {
    if (nonUniform) {
      return (
        <TextField
          value={selectedResolution}
          onChange={handleChangeResolution}
          variant="outlined"
          label="Resolution (km)"
          error={error}
          helperText={error ? 'Please enter a valid number' : ''}
        />
      );
    }

    return (
      <>
        <InputLabel>Resolution</InputLabel>
        <Select
          value={selectedResolution}
          onChange={handleChangeResolution}
          label="Resolution"
        >
          {resolutionOptions.map((option) => (
            <MenuItem key={option} value={option}>{option.toFixed(2)} km</MenuItem>
          ))}
        </Select>
      </>
    );
  };

  return (
    <div>
      <Typography align="center" variant="h5">Adjust Geospatial Resolution</Typography>
      <div className={classes.oldToNew}>
        <div className={classes.textWrapper}>
          <Typography variant="h6" align="center">current resolution</Typography>
          <Typography variant="h6" align="center">
            {nonUniform ? oldResolution : `${oldResolution.toFixed(2)} km`}
          </Typography>
        </div>
        <div className={classes.arrowIcon}>
          <ArrowForwardIcon fontSize="large" />
        </div>
        <div className={classes.textWrapper}>
          <Typography variant="h6" align="center">new resolution</Typography>
          <Typography variant="h6" align="center">
            {formatNewResolution()}
          </Typography>
        </div>
      </div>
      <div className={classes.bottomWrapper}>
        <FormControl variant="outlined" className={classes.selectWrapper}>
          {switchInput()}
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
      <PreviewTransformation
        jobString={jobString}
        datasetId={datasetId}
        annotations={annotations}
        cleanupRef={cleanupRef}
        createPreviewArgs={createPreviewArgs}
        disabled={!selectedResolution}
      />
    </div>
  );

// TODO: put this back
  //   // This panel shouldn't open without latLngAnnoted, but in case it does:
  //   return (
  //     <Typography align="center" variant="h6" style={{ marginTop: '64px' }}>
  //       Geospatial resolution cannot be adjusted without annotated latitude and longitude columns
  //     </Typography>
  //   );
  // };
});
