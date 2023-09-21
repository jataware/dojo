import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';
import TextField from '@mui/material/TextField';
import { useStyles } from 'tss-react/mui';

import { threshold_ops, topHandle, bottomHandle } from './constants';
import NodeTitles from './nodeLabels';
import NodeBase from './NodeBase';

const options = threshold_ops.map((i) => ({ value: i, label: i }));

function Select({
  input, handleId, nodeId, onChange
}) {
  const { css } = useStyles();
  return (
    <div>
      <Handle
        style={topHandle}
        type="target"
        position={Position.Top}
        id={handleId}
      />

      <div className={css`margin-bottom: 1rem;`}>
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
        />
      </div>

      <div>
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Type"
          select
          className="nodrag"
          value={input.type}
          onChange={onChange.bind(this, nodeId)}
          SelectProps={{
            native: true
          }}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </TextField>
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
