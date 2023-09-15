import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { useStyles } from 'tss-react/mui';
import {
  Handle, Position
} from 'reactflow';

// https://mui.com/material-ui/react-select/#grouping
// TODO: listsubheader for each dataset
// menuitem for each option
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { constantData, dojoMockDatasources } from './constants';
import NodeTitles from './nodeLabels';

// const useStyles = makeStyles()(() => ({

// }));

function Select({ input, nodeId, onChange }) {
  const { css } = useStyles();
  const { savedDatasets } = useSelector((state) => state.dag);
  return (
    <div className={css`
        position: relative;
        margin-bottom: 13px;
    `}
    >
      <TextField
        select
        label="Data Source"
        value={input}
        onChange={onChange.bind(this, nodeId)}
        SelectProps={{
          native: true
        }}
      >
        {Object.values(savedDatasets).map((dataset, arrayIndex) => {
          return (
            <optgroup key={`${arrayIndex}-${dataset.name}`} label={dataset.name}>
              {dataset.features.map((feature, itemIndex) => (
                <option key={`${arrayIndex}-${itemIndex}`} value={`${feature}::${savedDatasets.arrayIndex}`}>
                  {feature}
                </option>
              ))};
            </optgroup>
          );
        })}
      </TextField>
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}

function CustomNode({ id, data }) {
  console.log('NODE DATA', data)
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
        <strong>{NodeTitles.LOAD}</strong>
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
