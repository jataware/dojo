import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { makeStyles } from 'tss-react/mui';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import NodeTitles from './nodeLabels';

const useStyles = makeStyles()(() => ({
  selectWrapper: {
    position: 'relative',
    marginBottom: '10px',
  },
  headerStyle: {
    padding: '8px 10px',
    borderBottom: '1px solid #e2e8f0',
  },
  bodyStyle: {
    padding: '1rem 0.75rem 0.25rem 0.75rem',
  },
}));

function Select({ input, nodeId, onChange }) {
  const { classes } = useStyles();
  const { savedDatasets } = useSelector((state) => state.dag);

  return (
    <div className={classes.selectWrapper}>
      <TextField
        select
        label="Data Source"
        value={input}
        onChange={onChange.bind(this, nodeId)}
        SelectProps={{
          native: true,
          sx: {
            height: '56px',
            width: '154px'
          }
        }}
      >
        {Object.keys(savedDatasets).map((datasetId) => (
          <optgroup key={datasetId} label={savedDatasets[datasetId].name}>
            {savedDatasets[datasetId].features.map((feature, itemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <option key={`${datasetId}-${itemIndex}`} value={`${feature}::${datasetId}`}>
                {feature}
              </option>
            ))};
          </optgroup>
        ))}
      </TextField>
      <Handle
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
}

function CustomNode({ id, data }) {
  const { classes } = useStyles();

  return (
    <>
      <div className={classes.headerStyle}>
        <strong>{NodeTitles.LOAD}</strong>
      </div>
      <div className={classes.bodyStyle}>
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
