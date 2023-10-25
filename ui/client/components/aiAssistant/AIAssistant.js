import React, { useEffect, useState } from 'react';

import trim from 'lodash/trim';

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
    padding: `${theme.spacing(1)} ${theme.spacing(4)} ${theme.spacing(3)}`,
    width: theme.breakpoints.values.md,
  },
  inputBackdrop: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    borderTop: `1px solid ${theme.palette.grey[500]}`
  },
  paper: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    margin: `${theme.spacing(2)} ${theme.spacing(4)}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  }
}));
/** TODO:
* - scroll to end of last card + a bits
* - display extra info (documents used etc) in response card
* - show arrow down icon on screen when content to scroll to (like chatgpt)?
**/
const AIAssistant = () => {
  const { classes } = useStyles();
  // TODO: this will eventually be loaded in?
  const [previousSearches, setPreviousSearches] = useState(['test']);
  const [searchPhrase, setSearchPhrase] = useState('');
  useEffect(() => {
    document.title = 'AI Assistant';
  }, []);

  // disable if no content, incl. if just whitespace
  const inputDisabled = !searchPhrase.trim().length;

  const handleSearch = () => {
    if (searchPhrase.length) {
      setPreviousSearches((prevVals) => ([...prevVals, searchPhrase]));
      setSearchPhrase('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !inputDisabled) {
      // Enter submits if there is content and shift isn't pressed
      // otherwise allow it to do the default and add a new line
      handleSearch();
      event.preventDefault();
    } else if (event.key === 'Enter' && !event.shiftKey && inputDisabled) {
      // if the input is disabled (no content), still don't allow a new line without shift
      event.preventDefault();
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
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {search}
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            className={classes.paper}
            sx={{ backgroundColor: 'grey.100' }}
          >
            <ComputerIcon fontSize="large" />
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {mockResponse}
            </Typography>
          </Paper>
        </div>
      ))}
      <div className={classes.inputBackdrop}>
        <TextField
          value={searchPhrase}
          onChange={(event) => setSearchPhrase(event.target.value)}
          onKeyDown={handleKeyDown}
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
                  disabled={inputDisabled}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
    </Container>
  );
};

export default AIAssistant;
