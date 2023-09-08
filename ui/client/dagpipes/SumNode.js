import React, { memo } from 'react';
import { Handle, useReactFlow, useStoreApi, Position } from 'reactflow';
import { useStyles } from 'tss-react/mui';
import { pink } from '@mui/material/colors';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {dimensions} from './constants';

import NodeTitles from './nodeLabels';



function Select({ input, handleId, nodeId, onChange }) {
  const { css } = useStyles();
  const checkboxContainerStyle = css`
      display: flex;
      flex-direction: row;
  `;
  return (
    <div className={css`
        position: relative;
        margin-bottom: 10px;
    `}>
      <Handle
        className={css`
           top: -56px;
           width: 11px;
           height: 11px;
           border-radius: 2px;
           background-color: #778899;
        `}
        type="target"
        position={Position.Top}
        id={handleId}
      />
      <div>{NodeTitles.SUM_DIMENSION}</div>

      <FormGroup className={checkboxContainerStyle}>
        {dimensions.map(label => (
          <FormControlLabel
            key={label}
            control={<Checkbox
                       onChange={onChange.bind(this, nodeId)}
                       name={label}
                       disableRipple
                       checked={input[label]}
                    sx={{
                      color: pink[800],
                      '&.Mui-checked': {
                        color: pink[600],
                      },
                    }}
           />}
            label={label}
          />
        ))}
      </FormGroup>
      <Handle
        className={css`
          bottom: -25px;
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
           padding: 0.5rem;
           select {
             width: 100%;
             margin-top: 5px;
             font-size: 10px;
           }
        `;
  return (
    <>
      <div className={headerStyle}>
        <strong>{NodeTitles.SUM}</strong>
      </div>
      <div className={bodyStyle}>
        <Select
          nodeId={id}
          onChange={data.onChange}
          input={data.input}
        />
      </div>
    </>
  );
}

export default memo(CustomNode);
