import React, { useContext, useEffect, useRef, useState } from 'react';

import axios from 'axios';

import isEmpty from 'lodash/isEmpty';

import Box from '@mui/material/Box';
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
import { ThemeContext } from '../ThemeContextProvider';
import { drawerWidth } from '../Sidebar';
import { pageSlideAnimation } from '../NavBar';
import usePageTitle from '../uiComponents/usePageTitle';

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
* - show arrow down icon on screen when content to scroll to
* - add expandable (?) panel to response cards with list of documents used
*   - ids, link to view pdf?
* - disable question input & search button while asking?
*   - don't delete question until we get response
**/
const AIAssistant = () => {
  const { classes } = useStyles();
  const [previousQueries, setPreviousQueries] = useState({});
  const [responses, setResponses] = useState({});
  const [searchPhrase, setSearchPhrase] = useState('');
  const [anyResponseLoading, setAnyResponseLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState(null);
  const streamingResponseRef = useRef('');

  const { showSideBar } = useContext(ThemeContext);

  usePageTitle({ title: 'AI Assistant' });

  useEffect(() => {
    // scroll to the bottom anytime we get a new search in
    // TODO: when we have real responses come back, scroll to the bottom of those instead
    window.scroll({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [previousQueries]);

  useEffect(() => {
    // use this ref to keep track of the streamingResponse so that we can update
    // the responses object when we close the SSE connection on 'stream-complete'
    streamingResponseRef.current = streamingResponse;
  }, [streamingResponse]);

  // disable if no content, incl. if just whitespace, or while we're getting a response
  const disableSubmit = !searchPhrase.trim().length || anyResponseLoading;

  const performSearch = async (query, queryKey) => {
    // try {
    // TODO: Use this for local development, causemos-analyst for production
    // const queryResp = await axios.get(`http://localhost:8001/mock-message?query=${query}`);
    const knowledgeEndpoint = process.env.NODE_ENV === 'production' ? 'chat' : 'mock-chat';

    // const queryResp = await axios.get(
    //   `/api/dojo/knowledge/message?query=${searchPhrase}`
    // );
    // const queryResp = await axios.get(
    //   `/api/dojo/knowledge/${knowledgeEndpoint}?query=${searchPhrase}`
    // );
    const assistantConnection = new EventSource(
      `/api/dojo/knowledge/${knowledgeEndpoint}?query=${searchPhrase}`
    );

    assistantConnection.addEventListener('stream-answer', (event) => {
      console.log('this is the chat-stream event', event.data);

      const createAnswerString = (prevResp) => {
        if (prevResp && prevResp.answer) {
          // eslint-disable-next-line prefer-template
          return prevResp.answer + ' ' + event.data;
        }
        return event.data;
      };

      setStreamingResponse((prevResp) => ({
        ...prevResp, answer: createAnswerString(prevResp),
      }));
    });

    assistantConnection.addEventListener('stream-paragraphs', async (event) => {
      // console.log('this is stream-paragraphs', event.data)
      const paragraphs = JSON.parse(event.data);

      // create an object with just the unique filenames as keys
      const document_ids = paragraphs.reduce((obj, curr) => (
        { ...obj, [curr.document_id]: null }
      ), {});
      // go through the unique document_ids and fetch the document data
      const documentFetches = Object.keys(document_ids).map(async (document_id) => {
        try {
          const docFetchResp = await axios.get(`/api/dojo/documents/${document_id}`);
          return { document_id, data: docFetchResp.data };
        } catch (e) {
          console.log('error fetching document, skipping', e);
          return { document_id: null, data: {} };
        }
      });

      // wait for all the document fetches to complete
      const documentResults = await Promise.all(documentFetches);

      // and map them to the filenames
      documentResults.forEach(({ document_id, data }) => {
        document_ids[document_id] = data;
      });

      // add documents and paragraphs to the streamingResponse
      setStreamingResponse((prevResp) => ({ ...prevResp, documents: document_ids, paragraphs }));
    });

    assistantConnection.addEventListener('stream-complete', (event) => {
      console.log('this is the stream complete event', event);
      const currentStreamingResponse = streamingResponseRef.current;
      console.log('this is currentStreamingResponse', currentStreamingResponse)
      setResponses((prevResp) => ({
        ...prevResp, [queryKey]: { data: currentStreamingResponse, status: 'success' }
      }));
      setStreamingResponse(null);
      setAnyResponseLoading(false);
      assistantConnection.close();
    });

    assistantConnection.onerror = (event) => {
      // handle error or closed connection
      if (assistantConnection.readyState === EventSource.CLOSED) {
        console.log('Connection was closed');
      } else {
        console.error('An error occurred:', event);
      }
    };



    // } catch (error) {
    //   console.error(error);
    //   setResponses((oldResponses) => ({
    //     ...oldResponses,
    //     [queryKey]: {
    //       data: null,
    //       status: 'error',
    //     }
    //   }));
    // } finally {
    //   setAnyResponseLoading(false);
    // }
  };

  useEffect(() => {
    console.log('this is responses', responses)
  }, [responses])

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
  // return null;
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
          {streamingResponse?.answer && (
            <AIAssistantResponse text={streamingResponse.answer} />
          )}
          {responses[queryKey]?.status === 'success' && (
            <AIAssistantResponse
              text={responses[queryKey].data.answer}
              details={responses[queryKey].data.paragraphs}
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
{/*          {responses[queryKey]?.status === 'loading' && (
            <ChatCard
              icon={<CircularProgress size="35px" />}
              text="Loading Response..."
            />
          )}*/}
        </React.Fragment>
      ))}
      {isEmpty(previousQueries) && !anyResponseLoading && (
        <ChatCard
          icon={<InfoIcon color="primary" fontSize="large" />}
          text="Start querying documents with a question in the search box below"
        />
      )}
      <Box
        className={classes.inputBackdrop}
        sx={(theme) => ({
          left: 0,
          width: '100%',
          // use the same transition animation as the sidebar, defined in NavBar.js
          ...pageSlideAnimation(theme, ['left', 'width']),
          ...(showSideBar && {
            left: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
          }),
        })}
      >
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
      </Box>
    </Container>
  );
};

export default AIAssistant;
