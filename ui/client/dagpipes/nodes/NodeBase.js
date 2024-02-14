import React from 'react';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import InlineDocLink from '../../components/uiComponents/InlineDocLink';

const NodeBase = ({
  children, title, style
}) => {
  // parse the title with dashes for the link to the docs
  const dashedTitle = title.toLowerCase().split(' ').join('-');
  const parsedLink = `data-modeling.html#${dashedTitle}-node`;

  return (
    <div style={style}>
      <Typography variant="subtitle2" sx={{ padding: 1 }}>
        {title}
        <InlineDocLink link={parsedLink} title={`${title} Node`} />
      </Typography>
      {children && (
        <>
          <Divider />
          <div style={{ padding: '16px' }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default NodeBase;
