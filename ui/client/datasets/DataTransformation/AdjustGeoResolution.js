import React, { useCallback, useState } from 'react';

import isFinite from 'lodash/isFinite';
import trim from 'lodash/trim';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import Checkbox from '@mui/material/Checkbox';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';

import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import PreviewTransformation from './PreviewTransformation';
import { areLatLngAnnotated, generateProcessGeoResArgs } from './dataTransformationHelpers';
import { ExternalLink } from '../../components/Links';

const aggregationFunctions = [
  'count',
  'size',
  'sum',
  'mean',
  'std',
  'var',
  'sem',
  'min',
  'max',
  'first',
  'last',
];

const useStyles = makeStyles()((theme) => ({
  selectWrapper: {
    width: '200px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: theme.spacing(6),
    width: '100%',
    margin: [[theme.spacing(8), 0]],
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
  resolutionText: {
    fontWeight: '350',
  },
}));

export default ({
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
  const { classes } = useStyles();
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');
  const [selectedAggregation, setSelectedAggregation] = useState(savedAggregation || '');
  const [saveAttempt, setSaveAttempt] = useState(false);
  const [error, setError] = useState(false);
  const [nonUniformChecked, setNonUniformChecked] = useState(
    savedResolution === 'Non-uniform/event data' || false
  );

  const nonUniform = oldResolution === 'Non-uniform/event data';

  const validNumber = (value) => (
    value !== '' && isFinite(Number(value))
  );

  const handleSaveClick = () => {
    if (nonUniform) {
      if (selectedResolution !== '') {
        setSavedResolution(selectedResolution);
        closeDrawer();
      }
    } else {
      // toggle saveAttempt to show our errors if either select hasn't been chosen
      // though this shouldn't be possible with the button disabled
      setSaveAttempt(true);
      if (selectedResolution !== '' && selectedAggregation !== '') {
        setSavedResolution(selectedResolution);
        setSavedAggregation(selectedAggregation);
        setSaveAttempt(false);
        closeDrawer();
      }
    }
  };

  const handleChangeResolution = (event) => {
    // nonUniform has a textfield input, so we need to ensure we just receive numbers
    if (nonUniform) {
      // We also have the special case where the checkbox sets the resolution
      if (selectedResolution === oldResolution) {
        // don't show any errors and stop the validation
        setError(false);
        // the input is disabled so no need to continue with the state setters
        return;
      }
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

  const handleChangeAggregation = (event) => {
    setSelectedAggregation(event.target.value);
  };

  const handleNonUniformCheckboxChange = (event) => {
    setNonUniformChecked(event.target.checked);

    if (event.target.checked) {
      // when checked is true, set current resolution to Non-uniform/event data
      setSelectedResolution(oldResolution);
      setError(false);
    } else {
      // clear it if unchecked
      setSelectedResolution('');
    }
  };

  // Generate the arguments to pass into the preview component that runs the useElwoodData hook
  const createPreviewArgs = useCallback(() => {
    const args = generateProcessGeoResArgs({
      annotations,
      newMapResolution: selectedResolution,
      oldMapResolution: oldResolution,
      aggregation: selectedAggregation
    });
    args.preview_run = true;
    return args;
  }, [annotations, selectedResolution, oldResolution, selectedAggregation]);

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
    // handle disabling when the textField input is on screen
    if (nonUniform) {
      // don't disable the button if non-uniform is selected via checkbox
      if (selectedResolution === oldResolution) return false;
      // do disable if an invalid input is entered (not a number)
      if (!validNumber(selectedResolution)) return true;
    }

    // disable if there's no resolution
    if (!selectedResolution) return true;

    // disable if we're showing the selects (uniform data) & no aggregation function chosen
    if (!nonUniform && !selectedAggregation) return true;

    return false;
  };

  const switchInput = () => {
    if (nonUniform) {
      return (
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <TextField
            value={selectedResolution}
            onChange={handleChangeResolution}
            variant="outlined"
            label="Resolution (deg)"
            error={error}
            helperText={error ? 'Please enter a valid number' : ''}
            disabled={nonUniformChecked}
          />
        </FormControl>
      );
    }

    return (
      <>
        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel error={saveAttempt && !selectedAggregation}>
            Aggregation Function
          </InputLabel>
          <Select
            variant="standard"
            value={selectedAggregation}
            onChange={handleChangeAggregation}
            label="Aggregation Function"
            error={saveAttempt && !selectedAggregation}
          >
            {aggregationFunctions.map((funct) => (
              <MenuItem key={funct} value={funct}>
                {funct.toLowerCase().replaceAll('_', ' ')}
              </MenuItem>
            ))}
          </Select>
          {saveAttempt && !selectedAggregation && (
            <FormHelperText error={saveAttempt && !selectedAggregation}>
              Please select an aggregation function
            </FormHelperText>
          )}
          <ExternalLink
            style={{ marginTop: '8px' }}
            href="https://www.dojo-modeling.com/data-registration.html#adjust-geospatial-resolution"
          >
            Function Reference
          </ExternalLink>
        </FormControl>

        <FormControl variant="outlined" className={classes.selectWrapper}>
          <InputLabel>Resolution</InputLabel>
          <Select
            variant="standard"
            value={selectedResolution}
            onChange={handleChangeResolution}
            label="Resolution"
            error={saveAttempt && !selectedResolution}
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
          {saveAttempt && !selectedResolution && (
            <FormHelperText error={saveAttempt && !selectedResolution}>
              Please select a resolution
            </FormHelperText>
          )}
        </FormControl>
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
          {nonUniform && (
            <Tooltip
              title="We weren't able to detect a geospatial resolution.
                Check if you want to leave your resolution as non-uniform/event data,
                or input a number to adjust it to below."
            >
              <FormControlLabel
                control={(
                  <Checkbox
                    checked={nonUniformChecked}
                    onChange={handleNonUniformCheckboxChange}
                  />
                )}
                label={(
                  <Typography variant="caption">Leave data as non-uniform</Typography>
                )}
                style={{ marginLeft: '8px' }}
              />
            </Tooltip>
          )}
          <div className={classes.bottomWrapper}>
            {switchInput()}
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
            // an extra disabled check here because we don't want to run previews in this case
            disabled={disableButton() || selectedResolution === oldResolution}
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
};
