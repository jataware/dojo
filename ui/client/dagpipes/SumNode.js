import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import { pink } from '@mui/material/colors';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import { dimensions, topHandle, bottomHandle } from './constants';

import NodeBase from './NodeBase';
import NodeTitles from './nodeLabels';

function DimensionCheckboxes({
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
      <Typography variant="caption">
        {NodeTitles.SUM_DIMENSION}
      </Typography>

      <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {dimensions.map((label) => (
          <FormControlLabel
            key={label}
            sx={{
              // for short labels, use auto (2 columns per row)
              // if it's a long label, start at column 1 and span 2 columns
              gridColumn: label.length < 10 ? 'auto' : '1 / span 2',
            }}
            control={(
              <Checkbox
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
              />
            )}
            label={label}
          />
        ))}
      </FormGroup>
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
  <NodeBase title={NodeTitles.SUM}>
    <DimensionCheckboxes
      nodeId={id}
      onChange={data.onChange}
      input={data.input}
    />
  </NodeBase>
);

export default memo(CustomNode);
