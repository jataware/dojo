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

const scalarPositionRadios = {
  divide: [
    { value: 'denominator', label: 'Denominator' }, { value: 'numerator', label: 'Numerator' }
  ],
  power: [
    { value: 'exponent', label: 'Exponent' }, { value: 'base', label: 'Base' }
  ]
};

function CustomNode({ id, data, handleId }) {
  const [selectedOperation, setSelectedOperation] = useState('');

  const validNumber = (value) => (
    (typeof value === 'string' ? value.trim() !== '' : true) && Number.isFinite(Number(value))
  );

  const handleOperationChange = (event) => {
    if (event.target.value === 'divide' || event.target.value === 'power') {
      setSelectedOperation(event.target.value);
    } else {
      setSelectedOperation('');
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
      {selectedOperation && (
        <FormControl sx={{ marginX: 2 }}>
          <FormLabel sx={{ fontSize: 'caption.fontSize' }}>Scalar Position</FormLabel>
          <RadioGroup
            row
            name={`scalar_position_${selectedOperation}`}
            value={data.input[`scalar_position_${selectedOperation}`]}
            onChange={(event) => data.onChange(id, event)}
          >
            {scalarPositionRadios[selectedOperation].map((sp) => (
              <FormControlLabel
                key={sp.value}
                value={sp.value}
                slotProps={{ typography: { variant: 'caption' } }}
                control={<Radio size="small" />}
                label={sp.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
      <div style={{ margin: '16px' }}>
        <TextField
          error={!validNumber(data.input.value)}
          className="nodrag"
          label="Value"
          value={data.input.value}
          placeholder="0"
          required
          name="value"
          onChange={data.onChange.bind(this, id)}
          helperText={
            !validNumber(data.input.value) && 'Value must be a valid number and cannot be empty.'
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
