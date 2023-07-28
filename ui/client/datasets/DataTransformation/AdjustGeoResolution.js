import React, { useCallback, useState } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import PreviewTransformation from './PreviewTransformation';
import { generateProcessGeoResArgs } from './dataTransformationHelpers';

const useStyles = makeStyles()((theme) => ({
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
  },
  arrowIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default ({
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
  const { classes } = useStyles();
  const [selectedResolution, setSelectedResolution] = useState(savedResolution || '');

  const handleSaveClick = () => {
    if (selectedResolution !== '') setSavedResolution(selectedResolution);

    closeDrawer();
  };

  const handleChangeResolution = (event) => {
    setSelectedResolution(event.target.value);
  };

  const createPreviewArgs = useCallback((argsAnnotations) => {
    const args = generateProcessGeoResArgs(argsAnnotations, selectedResolution, oldResolution);
    args.preview_run = true;
    return args;
  }, [selectedResolution, oldResolution]);

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
};
