import React, { useEffect, useState } from 'react';

import axios from 'axios';

import isEmpty from 'lodash/isEmpty';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import InfoIcon from '@mui/icons-material/Info';
import SendIcon from '@mui/icons-material/Send';
import { makeStyles } from 'tss-react/mui';

import AIAssistantResponse from './AIAssistantResponse';
import ChatCard from './ChatCard';

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
  root: {
    paddingBottom: '200px',
    paddingTop: '50px',
  },
  error: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
  const [previousQueries, setPreviousQueries] = useState({});
  const [responses, setResponses] = useState({});
  const [searchPhrase, setSearchPhrase] = useState('');
  const [anyResponseLoading, setAnyResponseLoading] = useState(false);

  useEffect(() => {
    document.title = 'AI Assistant';
  }, []);

  useEffect(() => {
    // scroll to the bottom anytime we get a new search in
    // TODO: when we have real responses come back, scroll to the bottom of those instead
    window.scroll({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [previousQueries]);

  // disable if no content, incl. if just whitespace, or while we're getting a response
  const disableSubmit = !searchPhrase.trim().length || anyResponseLoading;

  const performSearch = async (query, queryKey) => {
    try {
      // TODO: Use this for local development, causemos-analyst for production
      // const queryResp = await axios.get(`http://localhost:8001/mock-message?query=${query}`);

      const mock = ''; // 'mock-';

      const queryResp = await axios.get(
        `/api/ai-docs/${mock}message?query=${searchPhrase}`
      );
      const response = {};
      response.response = queryResp.data;

      // create an object with just the unique filenames as keys
      const filenamesToDocs = queryResp.data.candidate_paragraphs.reduce((obj, curr) => (
        { ...obj, [curr.root_name]: null }
      ), {});

      // go through the unique filenames and fetch the document data
      const documentFetches = Object.keys(filenamesToDocs).map(async (filename) => {
        try {
          const docFetchResp = await axios.get(`/api/dojo/documents/by-didx-name?name=${filename}`);
          return { filename, data: docFetchResp.data };
        } catch (e) {
          console.log('error fetching document, skipping', e);
          return { filename: null, data: {} };
        }
      });

      // wait for all the document fetches to complete
      const documentResults = await Promise.all(documentFetches);
      // and map them to the filenames
      documentResults.forEach(({ filename, data }) => {
        filenamesToDocs[filename] = data;
      });

      response.documents = filenamesToDocs;

      setResponses((oldResponses) => ({
        ...oldResponses,
        [queryKey]: {
          data: response,
          status: 'success',
        }
      }));
    } catch (error) {
      console.error(error);
      setResponses((oldResponses) => ({
        ...oldResponses,
        [queryKey]: {
          data: null,
          status: 'error',
        }
      }));
    } finally {
      setAnyResponseLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchPhrase.length) {
      // store the user input query and the responses keyed under a timestamp
      // so we can match them up
      const queryKey = Date.now();
      setPreviousQueries((oldQueries) => ({ ...oldQueries, [queryKey]: searchPhrase }));
      setSearchPhrase('');
      setResponses((oldResponses) => ({
        ...oldResponses,
        [queryKey]: {
          data: null,
          status: 'loading',
        }
      }));
      setAnyResponseLoading(true);
      await performSearch(searchPhrase, queryKey);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !disableSubmit) {
      // Enter submits if there is content and shift isn't pressed
      // otherwise allow it to do the default and add a new line
      handleSearch();
      event.preventDefault();
    } else if (event.key === 'Enter' && !event.shiftKey && disableSubmit) {
      // if the input is disabled (no content), still don't allow a new line without shift
      event.preventDefault();
    }
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography variant="h4" align="center" className={classes.header}>
        Document Search AI Assistant
      </Typography>
      {Object.entries(previousQueries).map(([queryKey, query]) => (
        <React.Fragment key={queryKey}>
          <ChatCard
            icon={<AccountBoxIcon color="primary" fontSize="large" />}
            text={query}
          />
          {responses[queryKey]?.status === 'success' && (
            <AIAssistantResponse
              text={responses[queryKey].data.response.answer}
              details={responses[queryKey].data.response.candidate_paragraphs}
              documents={responses[queryKey].data.documents}
            />
          )}
          {responses[queryKey]?.status === 'error' && (
            <ChatCard
              icon={<InfoIcon color="warning" fontSize="large" />}
              text={(
                <div className={classes.error}>
                  There was an error generating a response to your question
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => performSearch(query, queryKey)}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            />
          )}
          {responses[queryKey]?.status === 'loading' && (
            <ChatCard
              icon={<CircularProgress size="35px" />}
              text="Loading Response..."
            />
          )}
        </React.Fragment>
      ))}
      {isEmpty(previousQueries) && !anyResponseLoading && (
        <ChatCard
          icon={<InfoIcon color="primary" fontSize="large" />}
          text="Start querying documents with a question in the search box below"
        />
      )}
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
                  disabled={disableSubmit}
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
