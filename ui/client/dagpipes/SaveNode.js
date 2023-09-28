import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import NodeBase from './NodeBase';
import NodeTitles from './nodeLabels';
import { topHandle } from './constants';

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
        value={input}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange.bind(this, nodeId)}
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
