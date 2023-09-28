import React, { useState } from 'react';

import isFinite from 'lodash/isFinite';
import trim from 'lodash/trim';

import { useSelector, useDispatch } from 'react-redux';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { setGeoResolutionColumn, setTimeResolutionColumn } from './dagSlice';

const timeOptions = ['daily', 'weekly', 'monthly', 'yearly', 'decadal'];

const ModelerResolution = () => {
  const [manualGeo, setManualGeo] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [error, setError] = useState(false);

  const {
    geoResolutionColumn, timeResolutionColumn
  } = useSelector((state) => state.dag);
  const dispatch = useDispatch();

  const validNumber = (value) => (
    value !== '' && isFinite(Number(value))
  );

  const handleGeoChange = (event) => {
    // remove leading and trailing whitespace, as we only want valid numbers
    const trimmedValue = trim(event.target.value);
    setManualGeo(trimmedValue);

    // When we have the text input, validate that it's a number
    if (validNumber(trimmedValue)) {
      setError(false);
      dispatch(setGeoResolutionColumn(event.target.value));
    } else {
      setError(true);
      dispatch(setGeoResolutionColumn(null));
    }

    // allow the input to be cleared
    if (event.target.value === '') setError(false);
  };

  const handleTimeChange = (event) => {
    setManualTime(event.target.value);
    dispatch(setTimeResolutionColumn(event.target.value));
  };

  const geoResolutionDisabled = geoResolutionColumn && !manualGeo;
  const timeResolutionDisabled = Boolean(timeResolutionColumn) && !manualTime;

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="time-resolution-label" shrink>Manual Time Resolution</InputLabel>
        <Select
          notched
          label="Manual Time Resolution"
          labelId="time-resolution-label"
          value={manualTime}
          disabled={timeResolutionDisabled}
          onChange={handleTimeChange}
          fullWidth
          size="small"
          margin="normal"
        >
          {/* Blank item to allow users to clear their selection here */}
          <MenuItem value="" sx={{ fontStyle: 'italic', color: 'grey.600' }}>
            Clear selection
          </MenuItem>
          {timeOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Manual Geo Resolution"
        value={manualGeo}
        disabled={geoResolutionDisabled}
        onChange={handleGeoChange}
        fullWidth
        size="small"
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        error={error}
        helperText={error ? 'Please enter a valid number' : ''}
      />
    </div>
  );
};

export default ModelerResolution;
