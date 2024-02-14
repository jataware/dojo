import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from '../constants';

function CustomNode() {
  return (
    <div>
      <NodeBase title={NodeTitles.MASK_DISTANCE} />
      <Handle
        type="target"
        position={Position.Top}
        style={topHandle}
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
