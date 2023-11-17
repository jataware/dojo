import React from 'react';

import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const InlineDocIconLink = ({ title, link }) => (
  <Tooltip arrow title={`See ${title} documentation (opens new tab)`}>
    <Link
      href={`https://www.dojo-modeling.com/${link}`}
      target="_blank"
      rel="noopener"
      color="inherit"
    >
      <HelpOutlineIcon
        sx={{
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginLeft: '4px',
          '&:hover': { color: 'primary.light' }
        }}
      />
    </Link>
  </Tooltip>
);

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
        <InlineDocIconLink link={parsedLink} title={`${title} Node`} />
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
