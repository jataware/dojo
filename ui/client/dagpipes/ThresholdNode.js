import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';
import TextField from '@mui/material/TextField';
import { useStyles } from 'tss-react/mui';

import { threshold_ops } from './constants';
import NodeTitles from './nodeLabels';

const options = threshold_ops.map((i) => ({ value: i, label: i }));

function Select({
  input, handleId, nodeId, onChange
}) {
  const { css } = useStyles();
  return (
    <div className={css`
        position: relative;
        margin-bottom: 10px;
    `}
    >
      <Handle
        className={css`
          top: -20px;
          width: 11px;
          height: 11px;
          border-radius: 2px;
          background-color: #778899;
        `}
        style={{
          top: '-53px',
          width: '11px',
          height: '11px',
          borderRadius: '2px',
          backgroundColor: '#778899',
        }}
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
        className={css`
          bottom: -21px;
          right: -15px;
          width: 11px;
          height: 11px;
          border-radius: 2px;
          background-color: #778899;
        `}
        type="source"
        position={Position.Bottom}
        id={handleId}
      />
    </div>
  );
}

function CustomNode({ id, data }) {
  const { css } = useStyles();

  const headerStyle = css`
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
  `;

  const bodyStyle = css`
    padding: 1rem 0.75rem 0.25rem 0.75rem;
    select {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
  `;
  return (
    <>
      <div className={headerStyle}>
        <strong>{NodeTitles.THRESHOLD}</strong>
      </div>
      <div className={bodyStyle}>
        <Select
          nodeId={id}
          input={data.input}
          onChange={data.onChange}
        />
      </div>
    </>
  );
}

export default memo(CustomNode);
