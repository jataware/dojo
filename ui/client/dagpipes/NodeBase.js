import React from 'react';

import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const NodeBase = ({
  children, title, style
}) => {
  // parse the title with dashes for the link to the docs
  const dashedTitle = title.toLowerCase().split(' ').join('-');

  return (
    <div style={style}>
      <Typography variant="subtitle2" sx={{ padding: 1 }}>
        {title}
        <Tooltip arrow title={`See ${title} Node documentation (opens in new tab)`}>
          <Link
            href={`https://www.dojo-modeling.com/data-modeling.html#${dashedTitle}-node`}
            target="_blank"
            color="inherit"
          >
            <HelpOutlineIcon
              sx={{
                cursor: 'pointer',
                fontSize: '0.8rem',
                marginLeft: '4px',
                '&:hover': { color: 'primary.light' }
              }}
            />
          </Link>
        </Tooltip>
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
