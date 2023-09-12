import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';
import { useStyles } from 'tss-react/mui';

import NodeTitles from './nodeLabels';

function CustomNode() {
  const { css } = useStyles();
  const headerStyle = css`
      padding: 8px 10px;
  `;
  return (
    <div className={headerStyle}>
      <strong>{NodeTitles.MULTIPLY}</strong>
      <div className="custom-node__multiply">
        <Handle
          className={css`
              left: 50px;
              width: 11px;
              height: 11px;
              border-radius: 2px;
              background-color: #778899;
            `}
          type="target"
          position={Position.Top}
          id="multiply-handle-1"
        />
        <Handle
          className={css`
              left: 135px;
              width: 11px;
              height: 11px;
              border-radius: 2px;
              background-color: #778899;
            `}
          type="target"
          id="multiply-handle-2"
          position={Position.Top}
        />
        <Handle
          className={css`
              width: 11px;
              height: 11px;
              border-radius: 2px;
              background-color: #778899;
              bottom: -6px;
            `}
          type="source"
          position={Position.Bottom}
        />
      </div>
    </div>
  );
}

export default memo(CustomNode);
