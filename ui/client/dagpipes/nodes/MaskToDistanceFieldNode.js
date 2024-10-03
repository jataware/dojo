import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from '../constants';

function CustomNode({ id, data }) {
  return (
    <div>
      <NodeBase title={NodeTitles.MASK_TO_DISTANCE_FIELD} previews={data.previews} logPreviews={data.logPreviews} />
      <Handle
        type="target"
        position={Position.Top}
        style={topHandle}
      />
      <FormControlLabel
        sx={{
          margin: 1
        }}
        control={(
          <Checkbox
            onChange={(event) => data.onChange(id, event)}
            name="include_initial_points"
            disableRipple
            checked={data.input.include_initial_points}
          />
        )}
        label="Include Initial Points"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={bottomHandle}
      />
    </div>
  );
}

export default memo(CustomNode);
