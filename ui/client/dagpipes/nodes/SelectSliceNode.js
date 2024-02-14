import React, { memo, useEffect, useState } from 'react';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import ModelerSelect from '../ModelerSelect';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from '../constants';

// Custom debounced effect hook
function useDebouncedEffect(effect, delay) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
  }, [effect, delay]);
}

function CustomNode({ id, data, handleId }) {
  const [validIndexInput, setValidIndexInput] = useState(true);

  const validateIndex = (input) => {
    // remove all whitespace
    const strippedInput = input.replace(/\s+/g, '');
    // matches: single integer or slice, or a comma separated list of integers and/or slices
    const regex = /^(-?\d+|(-?\d+:-?\d+))(,(-?\d+|(-?\d+:-?\d+)))*(,)?$/;
    if (regex.test(strippedInput) || !strippedInput.length) {
      setValidIndexInput(true);
    } else {
      setValidIndexInput(false);
    }
  };

  // Use the custom debounced effect hook
  useDebouncedEffect(() => validateIndex(data.input.index), 1000);

  const handleOperationChange = (event) => {
    data.onChange(id, event);
  };

  return (
    <div>
      <NodeBase title={NodeTitles.SELECT_SLICE} />
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <div style={{ margin: '16px' }}>
        <ModelerSelect
          value={data.input.operation}
          label="Dimension"
          onChange={handleOperationChange}
          options={[
            { label: 'Lat', value: 'lat' },
            { label: 'Lon', value: 'lon' },
            { label: 'Time', value: 'time' },
            { label: 'Country', value: 'country' },
          ]}
          name="dimension"
        />
      </div>
      <div style={{ margin: '16px' }}>
        <TextField
          error={!validIndexInput}
          className="nodrag"
          label="Index"
          value={data.input.index}
          name="index"
          onChange={data.onChange.bind(this, id)}
          helperText={
            !validIndexInput
            && 'Input must be an integer, a pair of colon-separated integers (1:5), or a list of integers and/or pairs separated by commas'
          }
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ marginBottom: 2, backgroundColor: 'grey.50' }}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={handleId}
        style={bottomHandle}
      />
    </div>
  );
}

export default memo(CustomNode);
