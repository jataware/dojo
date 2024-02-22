import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import NodeBase from './NodeBase';
import ModelerSelect from '../ModelerSelect';
import {
  threshold_ops, topHandle, bottomHandle, NodeTitles
} from '../constants';

const options = threshold_ops.map((i) => ({ value: i, label: i }));

function Select({
  input, handleId, nodeId, onChange
}) {
  return (
    <div>
      <Handle
        style={topHandle}
        type="target"
        position={Position.Top}
        id={handleId}
      />

      <TextField
        type="number"
        className="nodrag"
        label="Value or Percentile (%)"
        name="value"
        value={input.value}
        placeholder="1"
        onChange={(event) => onChange(nodeId, event)}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ marginBottom: 2, backgroundColor: 'grey.50' }}
      />

      <ModelerSelect
        value={input.type}
        label="Type"
        onChange={(event) => onChange(nodeId, event)}
        options={options}
        name="type"
      />
      <FormControlLabel
        sx={{
          margin: 1
        }}
        control={(
          <Checkbox
            onChange={(event) => onChange(nodeId, event)}
            name="preserve_nan"
            disableRipple
            checked={input.preserve_nan}
          />
        )}
        label="Preserve NaNs"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={handleId}
        style={bottomHandle}
      />
    </div>
  );
}

const CustomNode = ({ id, data }) => (
  <NodeBase title={NodeTitles.THRESHOLD}>
    <Select
      nodeId={id}
      input={data.input}
      onChange={data.onChange}
    />
  </NodeBase>
);

export default memo(CustomNode);
