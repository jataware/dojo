import React from 'react';

import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// color prop must be an MUI palette color to be applied to the Icon
const InlineDocLink = ({ title, link, color = 'primary' }) => (
  <Tooltip arrow title={`See ${title} documentation (opens new tab)`}>
    <Link
      href={`https://www.dojo-modeling.com/${link}`}
      target="_blank"
      rel="noopener"
      color="inherit"
    >
      <HelpOutlineIcon
        color={color}
        sx={{
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginLeft: '4px',
          '&:hover': { color: `${color}.dark` }
        }}
      />
    </Link>
  </Tooltip>
);

export default InlineDocLink;
