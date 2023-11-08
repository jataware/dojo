import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import NodeBase from './NodeBase';
import { topHandle, NodeTitles } from './constants';

/**
 *
 **/
function FileSelect({
  input, handleId, nodeId, onChange
}) {
  return (
    <div>
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <TextField
        className="nodrag"
        label="Name"
        name="name"
        value={input.name}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange.bind(this, nodeId)}
        sx={{ marginBottom: 2, backgroundColor: 'grey.50' }}
      />
      <TextField
        className="nodrag"
        label="Description"
        name="description"
        value={input.description}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange.bind(this, nodeId)}
        multiline
        minRows={3}
        sx={{ backgroundColor: 'grey.50' }}
      />
    </div>
  );
}

function CustomNode({ id, data }) {
  return (
    <NodeBase title={NodeTitles.SAVE}>
      <FileSelect
        nodeId={id}
        input={data.input}
        onChange={data.onChange}
      />
    </NodeBase>
  );
}

export default memo(CustomNode);
