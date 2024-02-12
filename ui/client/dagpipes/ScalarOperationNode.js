import React, { memo, useState } from 'react';
import {
  Handle, Position
} from 'reactflow';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';

import ModelerSelect from './ModelerSelect';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from './constants';

function CustomNode({ id, data, handleId }) {
  const [showPosition, setShowPosition] = useState(false);

  const handleOperationChange = (event) => {
    if (event.target.value === 'divide' || event.target.value === 'power') {
      setShowPosition(true);
    }
    data.onChange(id, event);
  };

  return (
    <div>
      <NodeBase title={NodeTitles.SCALAR_OPERATION} />
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <div style={{ margin: '16px' }}>
        <ModelerSelect
          value={data.input.operation}
          label="Operation"
          onChange={handleOperationChange}
          options={[
            { label: 'Add', value: 'add' },
            { label: 'Multiply', value: 'multiply' },
            { label: 'Divide', value: 'divide' },
            { label: 'Power', value: 'power' },
          ]}
          name="operation"
        />
      </div>
      {showPosition && (
        <FormControl sx={{ marginX: 2 }}>
          <FormLabel>Scalar Position</FormLabel>
          <RadioGroup
            row
            defaultValue="denominator"
            name="scalar_position"
          >
            <FormControlLabel
              value="numerator"
              slotProps={{ typography: { variant: 'caption' } }}
              control={<Radio size="small" />}
              label="Numerator"
            />
            <FormControlLabel
              value="denominator"
              slotProps={{ typography: { variant: 'caption' } }}
              control={<Radio size="small" />}
              label="Denominator"
            />
          </RadioGroup>
        </FormControl>
      )}
      <div style={{ margin: '16px' }}>
        <TextField
          type="number"
          className="nodrag"
          label="Value"
          value={data.input.value}
          placeholder="1"
          onChange={data.onChange.bind(this, id)}
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
