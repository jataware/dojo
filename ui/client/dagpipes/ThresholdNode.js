import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';
import TextField from '@mui/material/TextField';

import { threshold_ops, topHandle, bottomHandle } from './constants';
import NodeTitles from './nodeLabels';
import NodeBase from './NodeBase';
import ModelerSelect from './ModelerSelect';

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
        label="Value"
        value={input.value}
        placeholder="1"
        onChange={onChange.bind(this, nodeId)}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ marginBottom: 2 }}
      />

      <ModelerSelect
        value={input.type}
        label="Type"
        onChange={(event) => onChange(nodeId, event)}
        options={options}
        name="type"
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
