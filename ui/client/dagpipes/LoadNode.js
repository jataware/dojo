import React, { memo, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
  Handle, Position
} from 'reactflow';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

import { bottomHandle } from './constants';
import NodeTitles from './nodeLabels';
import NodeBase from './NodeBase';
import { setGeoResolutionColumn, setTimeResolutionColumn } from './dagSlice';

function Select({ input, nodeId, onChange }) {
  const {
    savedDatasets, geoResolutionColumn, timeResolutionColumn
  } = useSelector((state) => state.dag);
  const dispatch = useDispatch();

  const [geoSelected, setGeoSelected] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);
  const [savedSelectValue, setSavedSelectValue] = useState(null);

  const handleGeoChange = (event) => {
    setGeoSelected(event.target.checked);
    let columnUpdate = null;
    // only dispatch the saved value if it's checked
    if (event.target.checked) {
      columnUpdate = savedSelectValue;
    }
    // otherwise clear the value with null
    dispatch(setGeoResolutionColumn(columnUpdate));
  };

  const handleTimeChange = (event) => {
    setTimeSelected(event.target.checked);
    let columnUpdate = null;
    // only dispatch the saved value if it's checked
    if (event.target.checked) {
      columnUpdate = savedSelectValue;
    }
    // otherwise clear the value with null
    dispatch(setTimeResolutionColumn(columnUpdate));
  };

  const handleSelectChange = (event) => {
    // capture the value of the select so we can send it along with our resolution checkbox
    setSavedSelectValue(event.target.value);
    onChange(nodeId, event);
  };

  const geoResolutionDisabled = !savedSelectValue || timeSelected
    || (!geoSelected && Boolean(geoResolutionColumn));
  const timeResolutionSelected = !savedSelectValue || geoSelected
    || (!timeSelected && Boolean(timeResolutionColumn));

  return (
    <div>
      <TextField
        select
        label="Data Source"
        value={input}
        // nodrag is a react-flow class that prevents this from moving when the select is open
        className="nodrag"
        onChange={handleSelectChange}
        required
        SelectProps={{
          native: true,
          sx: {
            height: '56px',
            width: '206px'
          },
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <option value="" />
        {Object.keys(savedDatasets).map((datasetId) => (
          <optgroup key={datasetId} label={savedDatasets[datasetId].name}>
            {savedDatasets[datasetId].features.map((feature, itemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <option key={`${datasetId}-${itemIndex}`} value={`${feature}::${datasetId}`}>
                {feature}
              </option>
            ))};
          </optgroup>
        ))}
      </TextField>
      <FormGroup sx={{ marginY: 1 }}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={geoSelected}
              onChange={handleGeoChange}
            />
          )}
          label="Select as Geo Resolution"
          slotProps={{ typography: { variant: 'caption' } }}
          disabled={geoResolutionDisabled}
        />
        <FormControlLabel
          control={(
            <Checkbox
              checked={timeSelected}
              onChange={handleTimeChange}
            />
          )}
          label="Select as Time Resolution"
          slotProps={{ typography: { variant: 'caption' } }}
          disabled={timeResolutionSelected}
        />
      </FormGroup>
      <Handle
        type="source"
        position={Position.Bottom}
        style={bottomHandle}
      />
    </div>
  );
}

const CustomNode = ({ id, data }) => (
  <NodeBase title={NodeTitles.LOAD}>
    <Select
      nodeId={id}
      onChange={data.onChange}
      input={data.input}
    />
  </NodeBase>
);

export default memo(CustomNode);
