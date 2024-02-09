import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import ModelerSelect from './ModelerSelect';

import NodeBase from './NodeBase';
import { topHandle, bottomHandle, NodeTitles } from './constants';

function CustomNode({ id, data }) {
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
        <div style={{ margin: '16px' }}>
          <ModelerSelect
            value={data.input}
            label="Operation"
            onChange={(event) => data.onChange(id, event)}
            options={[
              { label: 'Add', value: 'add' },
              { label: 'Subtract', value: 'subtract' },
              { label: 'Multiply', value: 'multiply' },
              { label: 'Divide', value: 'divide' },
              { label: 'Power', value: 'power' },
            ]}
            name="join"
          />
        </div>
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
