import React from 'react';

import Box from '@material-ui/core/Box';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const RunCommandBox = ({ command }) => (
  <Box style={{
    backgroundColor: 'rgba(68, 93, 110, .5)',
    color: '#fff',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '5px',
    borderRadius: '5px',
    display: ((command?.command ?? '') === '' ? 'none' : 'block')
  }}
  >
    <span>
      <NavigateNextIcon style={{ color: 'yellow', verticalAlign: '-.3em' }} />
      {' '}
      {command?.command}
    </span>
  </Box>
);

export default RunCommandBox;
