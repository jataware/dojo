import React from 'react';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const NodeBase = ({ children, title }) => (
  <>
    <Typography variant="subtitle2" sx={{ padding: 1 }}>
      {title}
    </Typography>
    {children && (
      <>
        <Divider />
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      </>
    )}
  </>
);

export default NodeBase;
