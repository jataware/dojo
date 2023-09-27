import React, { memo, useState } from 'react';

import { useSelector } from 'react-redux';

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
// import { setGeoResolutionColumn, setTimeResolutionColumn } from './dagSlice';

function Select({ input, nodeId, onChange }) {
  const { savedDatasets } = useSelector((state) => state.dag);
  const [geoSelected, setGeoSelected] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);

  const handleGeoChange = (event) => {
    setGeoSelected(event.target.checked);
  };

  const handleTimeChange = (event) => {
    setTimeSelected(event.target.checked);
  };

  return (
    <div>
      <TextField
        select
        label="Data Source"
        value={input}
        // nodrag is a react-flow class that prevents this from moving when the select is open
        className="nodrag"
        onChange={onChange.bind(this, nodeId)}
        SelectProps={{
          native: true,
          sx: {
            height: '56px',
            width: '206px'
          }
        }}
      >
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
          disabled={timeSelected}
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
          disabled={geoSelected}
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
