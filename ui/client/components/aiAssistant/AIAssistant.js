import React, { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from '../ThemeContextProvider';
import AssistantChatCard from './AssistantChatCard';

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
  },
  root: {
    paddingBottom: '200px',
    paddingTop: '50px',
  }
}));
/** TODO:
* - show arrow down icon on screen when content to scroll to (like chatgpt)?
* - add expandable (?) panel to response cards with list of documents used
*   - ids, link to view pdf?
* - disable question input & search button while asking?
*   - don't delete question until we get response
**/
const AIAssistant = () => {
  const { classes } = useStyles();
  // TODO: this will eventually be loaded in?
  // rename from search to question?
  const [previousSearches, setPreviousSearches] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState('');

  const { setFixedNavBar } = useContext(ThemeContext);

  useEffect(() => {
    document.title = 'AI Assistant';
    // Make the navbar position: fixed
    setFixedNavBar(true);
    // and set it back to its default (static) when this effect cleans up
    return () => setFixedNavBar(false);
  }, [setFixedNavBar]);

  useEffect(() => {
    // scroll to the bottom anytime we get a new search in
    // TODO: when we have real responses come back, scroll to the bottom of those instead
    window.scroll({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [previousSearches]);

  // disable if no content, incl. if just whitespace
  const inputDisabled = !searchPhrase.trim().length;

  useEffect(() => {
    console.log('responses', previousSearches)
  }, [previousSearches]);

  const handleSearch = () => {
    if (searchPhrase.length) {
      const savedQuestionAnswerPair = { question: searchPhrase };
      axios.get('/assets/mockAIAssistantQuery.json')
        .then((response) => {
          savedQuestionAnswerPair.response = response.data;
          setPreviousSearches((oldPairs) => ([...oldPairs, savedQuestionAnswerPair]));
          setSearchPhrase('');
        });
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
        <React.Fragment key={i}>
          <AssistantChatCard text={search.question} />
          <AssistantChatCard
            text={search.response.answer}
            details={search.response.candidate_paragraphs}
            response
          />
        </React.Fragment>
      ))}
      <div className={classes.inputBackdrop}>
        <TextField
          value={searchPhrase}
          onChange={(event) => setSearchPhrase(event.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          multiline
          maxRows={6}
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
