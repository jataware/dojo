import React, {
  useContext, useEffect, useState
} from 'react';

import axios from 'axios';

import isEmpty from 'lodash/isEmpty';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Container from '@mui/material/Container';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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

const isScrolledToBottom = () => {
  const totalPageHeight = document.body.scrollHeight;
  const scrollPoint = window.scrollY + window.innerHeight;
  return scrollPoint >= totalPageHeight
};

const scrollToBottom = () => {
  window.scroll({ top: document.body.scrollHeight, behavior: 'smooth' });
};

const AIAssistant = () => {
  const { classes } = useStyles();
  const [previousQueries, setPreviousQueries] = useState({});
  const [responses, setResponses] = useState({});
  const [searchPhrase, setSearchPhrase] = useState('');
  const [anyResponseLoading, setAnyResponseLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(isScrolledToBottom());

  const [wasAtBottom, setWasAtBottom] = useState(true);

  const { showSideBar } = useContext(ThemeContext);

  usePageTitle({ title: 'AI Assistant' });

  useEffect(() => {
    // scroll back to bottom if previously there
    if (wasAtBottom) {
      scrollToBottom();
    }
  }, [streamingResponse, wasAtBottom]);

  useEffect(() => {
    const onScroll = () => {
      if (isScrolledToBottom()) {
        setShowScrollToBottom(false);
      } else {
        setShowScrollToBottom(true);
      }
    };
    window.addEventListener('scroll', onScroll);
  }, []);

  // disable if no content, incl. if just whitespace, or while we're getting a response
  const disableSubmit = !searchPhrase.trim().length || anyResponseLoading;

  const cleanupStreamingResp = () => {
    setStreamingResponse(null);
    setAnyResponseLoading(false);
  };

  const performSearch = async (query, queryKey) => {
    // local state for accessing streamingResponse within the stream-complete event handler
    // this is more immediate and up to date than a ref, and allows us to set the final response
    // off the streaming response once the stream is finished
    let latestStreamingResponse = null;

    const updateStreamingResponse = (updateFunction) => {
      if (isScrolledToBottom()) {
        // jump to the bottom when the new card is added
        setWasAtBottom(true);
      } else {
        // but don't force the user there if they aren't already scrolled there
        setWasAtBottom(false);
      }
      setStreamingResponse((prevResp) => {
        const updatedResp = updateFunction(prevResp);
        // keep track of the latest state in a local variable so it is always current
        latestStreamingResponse = updatedResp;
        return updatedResp;
      });
    };

    const knowledgeEndpoint = 'chat'//process.env.NODE_ENV === 'production' ? 'chat' : 'mock-chat';

    const assistantConnection = new EventSource(
      `/api/dojo/knowledge/${knowledgeEndpoint}?query=${searchPhrase}`
    );

    assistantConnection.addEventListener('stream-answer', (event) => {
      updateStreamingResponse((prevResp) => ({
        ...prevResp,
        answer: (prevResp.answer || '') + event.data,
      }));
    });

    assistantConnection.addEventListener('stream-paragraphs', async (event) => {
      const respData = JSON.parse(event.data);

      if (Array.isArray(respData.candidate_paragraphs)) {
        // create these here so that we can save empty versions if necessary
        const paragraphs = respData.candidate_paragraphs;
        let documents = {};

        // only do the following if we have paragraphs
        if (paragraphs.length) {
          // create an object with just the unique filenames as keys
          documents = paragraphs?.reduce((obj, curr) => (
            { ...obj, [curr.document_id]: null }
          ), {});

          // go through the unique documents and fetch the document data
          const documentFetches = Object.keys(documents).map(async (document_id) => {
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
            documents[document_id] = data;
          });
        }

        // add documents and paragraphs to the streamingResponse, even if empty
        // empty para/docs allow for a 'no details' state
        updateStreamingResponse((prevResp) => ({
          ...prevResp, documents, paragraphs
        }));
      }
    });

    assistantConnection.addEventListener('stream-complete', () => {
      const parsedStreamingResponse = {
        data: {
          ...latestStreamingResponse,
          paragraphs: latestStreamingResponse.paragraphs || [],
          documents: latestStreamingResponse.documents || {},
        },
        status: 'success',
      };
      setResponses((prevResps) => ({
        ...prevResps,
        [queryKey]: parsedStreamingResponse,
      }));
      cleanupStreamingResp();
      assistantConnection.close();
    });

    assistantConnection.onerror = () => {
      // handle error or closed connection
      if (assistantConnection.readyState === EventSource.CLOSED) {
        console.log('The connection was closed.');
        setResponses((prevResps) => ({
          ...prevResps, [queryKey]: { data: null, status: 'error' }
        }));
      } else {
        console.log('There was an error.');
        setResponses((prevResps) => ({
          ...prevResps, [queryKey]: { data: null, status: 'error' }
        }));
      }
      cleanupStreamingResp();
    };
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
      scrollToBottom();
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
        </React.Fragment>
      ))}
      {isEmpty(previousQueries) && !anyResponseLoading && (
        <ChatCard
          icon={<InfoIcon color="primary" fontSize="large" />}
          text="Start querying documents with a question in the search box below"
        />
      )}
      {streamingResponse?.answer && (
        <AIAssistantResponse
          text={streamingResponse.answer}
          details={streamingResponse.paragraphs}
          documents={streamingResponse.documents}
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
      {showScrollToBottom && (
        <Fab
          size="small"
          color="primary"
          sx={{ position: 'fixed', bottom: 104, right: 40 }}
          elevation={0}
          onClick={() => scrollToBottom()}
        >
          <ArrowDownwardIcon />
        </Fab>
      )}
    </Container>
  );
};

export default AIAssistant;
