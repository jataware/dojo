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
import { generateProcessGeoResArgs } from './dataTransformationHelpers';
import { ExternalLink } from '../../components/Links';

const aggregationFunctions = [
  'CONSERVATIVE',
  'SUM',
  'MINIMUM',
  'MAXIMUM',
  'MEDIAN',
  'AVERAGE',
  'BILINEAR',
  'BICUBIC',
  'NEAREST_NEIGHBOR',
];

export default withStyles((theme) => ({
  selectWrapper: {
    width: '200px',
  },
  bottomWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    margin: [[theme.spacing(6), 0]],
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
    const args = generateProcessGeoResArgs(
      argsAnnotations, selectedResolution, oldResolution, selectedAggregation
    );
    args.preview_run = true;
    return args;
  }, [selectedResolution, selectedAggregation, oldResolution]);

  return (
    <div>
      <Typography align="center" variant="h5">Adjust Geospatial Resolution</Typography>
      {oldResolution ? (
        <>
          <div className={classes.oldToNew}>
            <div className={classes.textWrapper}>
              <Typography variant="h6" align="center">current resolution</Typography>
              <Typography variant="h6" align="center">
                {oldResolution.toFixed(2)} km
              </Typography>
            </div>
            <div className={classes.arrowIcon}>
              <ArrowForwardIcon fontSize="large" />
            </div>
            <div className={classes.textWrapper}>
              <Typography variant="h6" align="center">new resolution</Typography>
              <Typography variant="h6" align="center">
                {selectedResolution !== '' && `${selectedResolution.toFixed(2)} km`}
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
                value={selectedResolution}
                onChange={handleChangeResolution}
                label="Resolution"
                error={saveAttempt && !selectedResolution}
              >
                {resolutionOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option.toFixed(2)} km</MenuItem>
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
        </>
      ) : (
        <Typography align="center" variant="h6" style={{ marginTop: '64px' }}>
          This dataset does not have a useable geospatial resolution
        </Typography>
      )}
    </div>
  );
});
