import React, { memo } from 'react';
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow';
import { useStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import NodeTitles from './nodeLabels';

/**
 *
 **/
function FileSelect({ input, handleId, nodeId, onChange }) {
  return (
    <div className="custom-node__save">
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
      />
      <TextField
        className="nodrag"
        label="Filename"
        value={input}
        placeholder="output.nc"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={onChange.bind(this, nodeId)}
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
         padding: 1rem;
      `;
  return (
    <>
      <div className={headerStyle}>
        <strong>{NodeTitles.SAVE}</strong>
      </div>
      <div className={bodyStyle}>
        <FileSelect
          nodeId={id}
          input={data.input}
          onChange={data.onChange}
        />
      </div>
    </>
  );
}

export default memo(CustomNode);
