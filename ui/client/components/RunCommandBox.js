import React from 'react';

import Box from '@material-ui/core/Box';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Typography from '@material-ui/core/Typography';

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
      <Typography variant="subtitle2">Model Directive:</Typography>
      <NavigateNextIcon
        style={{
          color: 'yellow',
          verticalAlign: '-.3em',
          marginRight: '4px'
        }}
      />
      <Typography variant="subtitle2" component="span">{command?.command}</Typography>
    </span>
  </Box>
);

export default RunCommandBox;
