import React from 'react';

import Box from '@material-ui/core/Box';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const RunCommandBox = ({ text }) => (
  <Box style={{
    backgroundColor: '#445d6e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap'
  }}
  >
    <NavigateNextIcon style={{ color: 'yellow' }} />
    {' '}
    <span>{text}</span>
  </Box>
);

export default RunCommandBox;
