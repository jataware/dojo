import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import ModelerSelect from './ModelerSelect';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from './constants';

function CustomNode({ id, data, handleId }) {
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
          onChange={(event) => data.onChange(id, event)}
          options={[
            { label: 'Add', value: 'add' },
            { label: 'Multiply', value: 'multiply' },
            { label: 'Divide', value: 'divide' },
            { label: 'Power', value: 'power' },
          ]}
          name="operation"
        />
      </div>
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
