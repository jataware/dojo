import React from 'react';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    margin: `${theme.spacing(2)} ${theme.spacing(4)}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
}));

const AssistantChatCard = ({ text, response = false }) => {
  const { classes } = useStyles();

  return (
    <Paper
      variant="outlined"
      className={classes.paper}
      sx={{ backgroundColor: response ? 'grey.100' : 'white' }}
    >
      {response ? <ComputerIcon fontSize="large" />
        : <AccountBoxIcon color="primary" fontSize="large" />}
      <Typography
        variant="body1"
        sx={{ whiteSpace: 'pre-wrap' }}
      >
        {text}
      </Typography>
    </Paper>
  );
};

export default AssistantChatCard;
