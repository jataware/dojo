import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from './constants';

function CustomNode() {
  const leftHandle = { left: '51px', ...topHandle };
  const rightHandle = { left: '128px', ...topHandle };
  return (
    <div>
      <NodeBase title={NodeTitles.MULTIPLY} />
      <div className="custom-node__multiply">
        <Handle
          type="target"
          position={Position.Top}
          id="multiply-handle-1"
          style={leftHandle}
        />
        <Handle
          type="target"
          id="multiply-handle-2"
          position={Position.Top}
          style={rightHandle}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={bottomHandle}
        />
      </div>
    </div>
  );
}

export default memo(CustomNode);
