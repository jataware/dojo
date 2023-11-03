import React from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const ChatCard = ({
  backgroundColor = 'white', icon, text, children,
}) => (
  <Paper
    variant="outlined"
    sx={{ backgroundColor, padding: [2, 4], margin: [2, 4] }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {icon}
      <Typography
        variant="body1"
        component="div"
        sx={{ whiteSpace: 'pre-wrap', width: '100%' }}
      >
        {text}
      </Typography>
    </Box>
    {children}
  </Paper>
);

export default ChatCard;
