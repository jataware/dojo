import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import Typography from '@mui/material/Typography';

import AutoComplete from './Autocomplete';
import NodeTitles from './nodeLabels';
import NodeBase from './NodeBase';
import { topHandle, bottomHandle } from './constants';

/**
 *
 **/
function Select({
  input, handleId, nodeId, onChange
}) {
  const handleChange = (_, newValue) => {
    onChange(nodeId, { target: { value: newValue } });
  };

  return (
    <div>
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <Typography variant="caption" gutterBottom>Countries</Typography>
      <AutoComplete
        value={input}
        onChange={handleChange}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={handleId}
        style={bottomHandle}
      />
    </div>
  );
}

// reduce by country => from re-gridded to country data
const CustomNode = ({ id, data }) => (
  <NodeBase title={NodeTitles.COUNTRY_SPLIT}>
    <Select
      nodeId={id}
      input={data.input}
      onChange={data.onChange}
    />
  </NodeBase>
);

export default memo(CustomNode);
