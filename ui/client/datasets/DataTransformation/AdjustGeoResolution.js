import React, { useCallback, useState } from 'react';

import isFinite from 'lodash/isFinite';
import trim from 'lodash/trim';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import PreviewTransformation from './PreviewTransformation';
import { areLatLngAnnotated, generateProcessGeoResArgs } from './dataTransformationHelpers';

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
  resolutionText: {
    fontWeight: '350',
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

  const validNumber = (value) => (
    value !== '' && isFinite(Number(value))
  );

  const handleSaveClick = () => {
    if (selectedResolution !== '') setSavedResolution(selectedResolution);

    closeDrawer();
  };

  const handleChangeResolution = (event) => {
    // nonUniform has a textfield input, so we need to ensure we just receive numbers
    if (nonUniform) {
      // remove leading and trailing whitespace, as we only want valid numbers
      const trimmedValue = trim(event.target.value);
      setSelectedResolution(trimmedValue);

      // When we have the text input, validate that it's a number
      if (validNumber(trimmedValue)) {
        setError(false);
      } else {
        setError(true);
      }
    } else {
      // uniform have a select with pre-set options
      setSelectedResolution(event.target.value);
    }
  };

  const createPreviewArgs = useCallback((argsAnnotations) => {
    const args = generateProcessGeoResArgs(argsAnnotations, selectedResolution, oldResolution);
    args.preview_run = true;
    return args;
  }, [selectedResolution, oldResolution]);

  const formatNewResolution = () => {
    if (!selectedResolution || selectedResolution === '') return '';
    if (nonUniform) {
      if (validNumber(selectedResolution)) {
        return `${selectedResolution} deg`;
      }

      return '';
    }
    return `${selectedResolution.toFixed(2)} deg`;
  };

  const disableButton = () => {
    if (nonUniform) {
      if (!validNumber(selectedResolution)) return true;
    }

    if (!selectedResolution) return true;

    return false;
  };

  const switchInput = () => {
    if (nonUniform) {
      return (
        <TextField
          value={selectedResolution}
          onChange={handleChangeResolution}
          variant="outlined"
          label="Resolution (deg)"
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
          {resolutionOptions.deg.map((option, index) => (
            <MenuItem key={option} value={option}>
              <Tooltip
                placement="bottom-end"
                arrow
                title={
                  resolutionOptions.km[index] ? `${resolutionOptions.km[index].toFixed(2)} km` : ''
                }
              >
                <span style={{ width: '100%' }}>{`${option.toFixed(2)} deg`}</span>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </>
    );
  };

  return (
    <div>
      <Typography align="center" variant="h5">Adjust Geospatial Resolution</Typography>
      {areLatLngAnnotated(annotations) ? (
        <>
          <div className={classes.oldToNew}>
            <div className={classes.textWrapper}>
              <Typography variant="h6" align="center">current resolution</Typography>
              <Typography variant="h6" className={classes.resolutionText} align="center">
                {nonUniform ? oldResolution : `${oldResolution.toFixed(2)} deg`}
              </Typography>
            </div>
            <div className={classes.arrowIcon}>
              <ArrowForwardIcon fontSize="large" />
            </div>
            <div className={classes.textWrapper}>
              <Typography variant="h6" align="center">new resolution</Typography>
              <Typography variant="h6" className={classes.resolutionText} align="center">
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
              disabled={disableButton()}
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
            disabled={disableButton()}
          />
        </>
      ) : (
        <Typography align="center" variant="h6" style={{ marginTop: '64px' }}>
          Geospatial resolution cannot be adjusted without annotated
          latitude and longitude columns
        </Typography>
      )}
    </div>
  );
});
