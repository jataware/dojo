import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    margin: `${theme.spacing(2)} ${theme.spacing(4)}`,
  },
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  details: {
    display: 'grid',
    gridTemplateColumns: '3rem 1fr',
    gap: '1rem 0',
    marginTop: theme.spacing(2),
  },
}));

const AssistantChatCard = ({ text, details, response = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { classes } = useStyles();

  return (
    <Paper
      variant="outlined"
      className={classes.paper}
      sx={{ backgroundColor: response ? 'grey.100' : 'white', }}
    >
      <div className={classes.mainContent}>
        {response ? <ComputerIcon fontSize="large" />
          : <AccountBoxIcon color="primary" fontSize="large" />}
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {text}
        </Typography>
      </div>
      {response && (
        <div className={classes.showDetailsWrapper}>
          <Button
            variant="text"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={showDetails ? <IndeterminateCheckBoxIcon /> : <AddBoxIcon />}
            sx={{ display: 'flex', margin: '0 auto' }}
          >
            Show Details
          </Button>
          <Collapse in={showDetails}>
            <div className={classes.details}>
              {details.map((para, i) => (
                <>
                  <Typography
                    variant="body2"
                    key={`${para.root_name}/${para.paragraph_idx}`}
                    sx={{
                      display: 'contents',
                    }}
                  >
                    <span>
                      [{para.paragraph_idx}]
                    </span>
                    <span>
                      {para.paragraph}
                    </span>
                  </Typography>
                  {/* Don't show the Divider for the final item */}
                  {i < details.length - 1 && (
                    <Divider sx={{ gridColumn: 'span 2' }} variant="middle" />
                  )}
                </>
              ))}
            </div>
          </Collapse>
        </div>
      )}
    </Paper>
  );
};

export default AssistantChatCard;
