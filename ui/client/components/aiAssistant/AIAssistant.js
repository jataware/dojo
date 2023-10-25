import React, { useEffect, useState } from 'react';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SendIcon from '@mui/icons-material/Send';
import { makeStyles } from 'tss-react/mui';

const mockResponse = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
ut labore et dolore magna aliqua. Et leo duis ut diam. Faucibus scelerisque eleifend donec pretium vulputate
sapien nec sagittis aliquam. Pellentesque id nibh tortor id. Sed vulputate mi sit amet mauris commodo quis imperdiet massa.`

const useStyles = makeStyles()((theme) => ({
  header: {
    padding: `${theme.spacing(4)} 0`,
  },
  input: {
    width: '650px',
    position: 'fixed',
    bottom: 0,
    padding: theme.spacing(4),
    margin: '0 auto',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  paper: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    margin: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  }
}));
// TODO: after search, set searchphrase in a card/paper, show response below it
// text input always lives at bottom of screen
const AIAssistant = () => {
  const { classes } = useStyles();
  // TODO: this will eventually be loaded in?
  const [previousSearches, setPreviousSearches] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState('');
  useEffect(() => {
    document.title = 'AI Assistant';
  }, []);

  const handleSearch = () => {
    if (searchPhrase.length) {
      console.log('doing the search:', searchPhrase)
      previousSearches.push(searchPhrase);
      setSearchPhrase('');
    }
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography variant="h4" align="center" className={classes.header}>
        Document Search AI Assistant
      </Typography>
      {previousSearches.map((search, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <Paper variant="outlined" className={classes.paper}>
            <AccountBoxIcon color="primary" fontSize="large" />
            <Typography variant="body1">{search}</Typography>
          </Paper>
          <Paper variant="outlined" className={classes.paper} sx={{ backgroundColor: 'grey.100'}}>
            <ComputerIcon fontSize="large" />
            <Typography variant="body1">{mockResponse}</Typography>
          </Paper>
        </div>
      ))}
      <TextField
        value={searchPhrase}
        onChange={(event) => setSearchPhrase(event.target.value)}
        variant="outlined"
        multiline
        className={classes.input}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              // same as the standard mui border color primary.main
              // but with opacity 0.3 to clash less with the grey endAdornment icon
              borderColor: 'rgba(26, 118, 210, 0.3)'
            }
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSearch}
                edge="end"
                disabled={!searchPhrase.length}
              >
                <SendIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Container>
  );
};

export default AIAssistant;
