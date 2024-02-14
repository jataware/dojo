import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import TextField from '@mui/material/TextField';

import ModelerSelect from '../ModelerSelect';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from '../constants';

function CustomNode({ id, data, handleId }) {
  // const validNumber = (value) => (
  //   (typeof value === 'string' ? value.trim() !== '' : true) && Number.isFinite(Number(value))
  // );

  const handleOperationChange = (event) => {
    data.onChange(id, event);
  };

  return (
    <div>
      <NodeBase title={NodeTitles.SELECT_SLICE} />
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <div style={{ margin: '16px' }}>
        <ModelerSelect
          value={data.input.operation}
          label="Dimension"
          onChange={handleOperationChange}
          options={[
            { label: 'Lat', value: 'lat' },
            { label: 'Lon', value: 'lon' },
            { label: 'Time', value: 'time' },
            { label: 'Country', value: 'country' },
          ]}
          name="dimension"
        />
      </div>
      <div style={{ margin: '16px' }}>
        <TextField
          // error={!validNumber(data.input.index)}
          className="nodrag"
          label="Index"
          value={data.input.index}
          placeholder="0"
          required
          name="index"
          onChange={data.onChange.bind(this, id)}
          // helperText={
          //   !validNumber(data.input.index) && 'Value must be a valid number and cannot be empty.'
          // }
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
