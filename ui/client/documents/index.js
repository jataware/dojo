import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';

import Button from '@material-ui/core/Button';
import { GridOverlay, DataGrid } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';
import map from 'lodash/map';
import get from 'lodash/get';

import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';

import { Link as RouteLink } from 'react-router-dom';

import { calculateHighlightTargets } from "./utils";

import ExpandableDataGridCell from "../components/ExpandableDataGridCell";

const expandableCell = ({ value, colDef }) => (
    <ExpandableDataGridCell
      value={value}
      width={colDef.computedWidth}
    />
);

export const ConfidenceBar = withStyles((theme) => ({
  root: {
    height: 15,
  },
  colorPrimary: {
    border: '1px solid gray',
    backgroundColor: 'transparent',
    background: 'repeating-linear-gradient( -45deg, gray, gray 1px, white 1px, white 4px )'
  },
  bar: {
    backgroundColor: '#00cd00',
  },
}))(LinearProgress);

const semanticSearchParagraphs = async(query) => {
  let url = `/api/dojo/paragraphs/search?query=${query}&size=40`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * @param docId the document id to fetch for.
 *
 * Fetch an individual dart document.
 **/
const fetchDocument = async (docId) => {
  const response = await axios.get(`/api/dojo/documents/${docId}`);
  return response.data;
};

const fetchDocumentFullText = async (documentId) => {
  // paragraph id format: documentId-<paragraphIndex>
  const url = `/api/dojo/documents/${documentId}/paragraphs?size=200`;

  const response = await axios.get(url);
  return response.data.paragraphs;
};


/**
 * Fetches ALL paragraphs in DB until there's no more scroll ID
 * or the max limit of items is reached.
 * Logic copies from ViewFeatures.js, although we have different requirements here.
 * Only used on experimental paragraph listings.
 **/
const fetchParagraphs = async (
  setParagraphs, setSearchLoading, setParagraphsError, scrollId
) => {
  setSearchLoading(true);

  let url = `/api/dojo/paragraphs`;
  if (scrollId) {
    url += `?scroll_id=${scrollId}`;
  }

  const paragraphsRequest = axios.get(url).then(
    (response) => {
      const data = response.data;
      return data;
    }
  );

  let preparedParagraphs = null;
  let hitCountThreshold = false;

  preparedParagraphs = paragraphsRequest.then((paragraphsData) => {

    setParagraphs((prev) => {

      // TODO Lets fetch max 100 paragraphs for now
      if (prev.length > 100) {
        hitCountThreshold = true;
      }

      return !scrollId ? paragraphsData.results : prev.concat(paragraphsData.results);
    });

    return [paragraphsData.scroll_id, paragraphsData.results];
  });

  preparedParagraphs.then(([ newScrollId, results ]) => {

    // when there's no scroll id, we've hit the end of the results
    if (newScrollId && !hitCountThreshold) {
      // if we get a scroll id back, there are more results
      // so call fetchModels again to fetch the next set
      fetchParagraphs(setParagraphs, setSearchLoading, setParagraphsError, newScrollId);
    } else {
      setSearchLoading(false);
    }
  });

  preparedParagraphs.catch((error) => {
    console.log('error:', error);
    setParagraphsError(true);
  });
};

/**
 * Blue linear loading animation displayed when table loading/searching of
 * features is still in progress.
 */
function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <div style={{ position: 'absolute', top: 0, width: '100%' }}>
        <LinearProgress />
      </div>
    </GridOverlay>
  );
}

/**
 *
 **/
const documentColumns = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 200,
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1
  },
  {
    field: 'publisher',
    headerName: 'Publisher',
    width: 200,
  },
  {
    field: 'description',
    headerName: 'Description',
    renderCell: expandableCell,
    flex: 2
  }
];

/**
 *
 **/
export const ViewDocumentDialog = ({doc, onClose}) => {

  const document = doc || {};
  const [documentText, setDocumentText] = useState(null);
  const [documentTextLoading, setDocumentTextLoading] = useState(null);

  useEffect(() => {

    if(!doc?.id) {
      return;
    }

    setDocumentTextLoading(true);

    fetchDocumentFullText(doc.id)
      .then(response => {
        setDocumentText(response);
      })
      .finally(() => setDocumentTextLoading(false));

  }, [doc]);


  return (
    <Dialog
      open={Boolean(doc)}
      onClose={onClose}
      maxWidth="md"
    >
      <DialogTitle style={{paddingBottom: 1}}>
        {document.title}
      </DialogTitle>

      <Divider
        variant="fullWidth"
        style={{margin: "0.5rem 0"}}
      />

      <DialogContent>
        {!isEmpty(doc) && (
          <dl>
            {["publisher", "creation_date", "type", "original_language",
              "classification", "producer", "stated_genre"]
             .map((item, idx) => document[item] ? (
            <div>
              <dt>{startCase(item)}</dt>
              <dd>{document[item]}</dd>
            </div>
          ) : null)}
        </dl>
        )}

        {documentTextLoading ? (
          <CircularProgress />
        ) : documentText?.length ? (
          <div>
            <p>Full Text</p>
              {documentText.map(paragraph => Boolean(paragraph) && (
                <DialogContentText key={paragraph.id}>
                  {paragraph.text}
                </DialogContentText>
              ))}
            {documentText.length > 200 && (
              <p>Document continues. Truncated to 200 lines.</p>
            )}
          </div>
        ) : (
          <p>Document only contains metadata fields. Does not have text contents.</p>
        )}

      </DialogContent>

    </Dialog>
  );

};

export const ParagraphTile = withStyles((theme) => ({
  root: {
    padding: "0.5rem 1.5rem",
    margin: "0.75rem 0",
    border: "1px solid #B2dfee",
    borderRadius: 2,
    background: "#f9f9f9",
    boxShadow: "4px 4px 8px 0px #9a999969",
    cursor: "pointer",
    ["& dl > div"]: {display: "flex", // alignItems: "center"
                    },
    ["& dd"]: {margin: 0}
  },
  squareChip: {
    borderRadius: 0,
    background: "#e7e6e6",
    marginRight: "0.75rem"
  },
  chipLabel: {
    fontWeight: "bold",
    width: "4rem",
    display: "flex",
    justifyContent: "center"
  }
}))(({classes, paragraph, highlights=null, query, onClick}) => {

  const handleClick = () => onClick(paragraph);

  return (
    <div
      className={classes.root}
      onClick={handleClick}
    >
      <Typography
        variant="body1"
        component="div">

        <dl>
          <div style={{alignItems: "center", marginBottom: "1rem"}}>
            <dt>
              <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="ID" />
            </dt>
            <dd>{paragraph.id}</dd>
          </div>

          <div style={{alignItems: "center", marginBottom: "1rem"}}>
            <dt>
              <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="Title" />
            </dt>
            <dd>{paragraph.parent_document.title || "No Title Available"}</dd>
          </div>

          {paragraph.parent_document.publisher && (
            <div style={{alignItems: "center", marginBottom: "1rem"}}>
              <dt>
                <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="Publisher" />
              </dt>
              <dd>{paragraph.parent_document.publisher}</dd>
            </div>
          )}

          <div>
            <dt>
              <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="text" />
            </dt>
            <dd>{(highlights || calculateHighlightTargets(paragraph.text, query))
                 .map((partInfo, idx) => (
                   <span
                     key={idx}
                     style={partInfo.highlight ?
                            {fontWeight: 'bold', background: 'yellow'} :
                            {}}
                   >
                     {partInfo.text}
                   </span>
                 ))}</dd>
          </div>
        </dl>

        <div style={{display: "flex", alignItems: "center"}}>
          <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="Hit%" />
          <div style={{display: "block", width: "8rem"}}>
            <ConfidenceBar
              value={Math.sqrt(paragraph?.metadata?.match_score || 0) * 100}
              variant='determinate'
            />
          </div>
        </div>
      </Typography>

      <br />
    </div>
  );
});

/**
 *
 */
const ViewDocumentsGrid = withStyles(() => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: "2rem",
    marginTop: "1rem"
  },
  aboveTableWrapper: {
    display: 'flex',
    maxWidth: "100vw",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
  }
}))(({ classes }) => {
  // use refs here to have references that won't trigger any rerenders
  const scrollIdRef = useRef(null);
  const cachedDocumentsRef = useRef({});

  const [documents, setDocuments] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const fetchData = useCallback(
    // we use DataGrid's page index to maintain a cache for what DG should display
    // on each page of results. The API just uses a scroll_id and has no notion of this page
    async (page) => {
      setDocumentsLoading(true);
      setDocumentsError(null);
      // clear documents when loading so that we don't display the previous page
      // before loading the next set of results
      setDocuments(null);

      // check if data for the page is already in the cache
      if (cachedDocumentsRef.current[page]) {
        setDocuments(cachedDocumentsRef.current[page]);
        setDocumentsLoading(false);
      } else {
        try {
          const response = await axios.get(
            // eslint-disable-next-line prefer-template
            `/api/dojo/documents?size=20${scrollIdRef.current ? '&scroll_id=' + scrollIdRef.current : ''}`
          );

          const { data } = response;
          if (data?.scroll_id && !scrollIdRef.current) {
            scrollIdRef.current = data.scroll_id;
          }

          // store the fetched data in the cache
          cachedDocumentsRef.current = {
            ...cachedDocumentsRef.current,
            [page]: data,
          };

          setDocuments(data);
        } catch (error) {
          setDocumentsError(error);
        } finally {
          setDocumentsLoading(false);
        }
      }
    }, []
  );

  // do the initial fetch to load our first page
  useEffect(() => {
    // fetchData only references refs and state setters, so this should only be called once
    fetchData(0);
  }, [fetchData]);

  // fetch the rows out of the cache for page 0 so that we maintain it even when we clear
  // documents state on page change, defaulting to 0 to prevent NaN in case we have no hits
  const totalRowsCount = Number(documents?.hits)
    || Number(cachedDocumentsRef.current[0]?.hits) || 0;

  const handlePageChange = (params) => {
    fetchData(params);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermValue, setSearchTermValue] = useState('');
  const updateSearchTerm = useCallback(debounce(setSearchTerm, 1000), []);

  const [searchLoading, setSearchLoading] = useState(false);
  const [docParagraphResults, setDocParagraphResults] = useState(null);
  const [highlights, setHighlights] = useState(null);

  const [openedDocument, setOpenedDocument] = useState(null);

  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

  const performSearch = () => {
    if (!searchTerm) {
      setDocParagraphResults(null);
      return;
    }

    setSearchLoading(true);
    setHighlights(null);

    semanticSearchParagraphs(searchTerm)
      .then((results) => {
        const allParagraphs = results.results;

        // for each, fetch their parent document's in order to append its
        // title and publisher
        const allDocPromises = allParagraphs.map((paragraph, idx) => {
          const documentPromise = fetchDocument(paragraph.document_id);

          documentPromise.then(doc => {
            allParagraphs[idx].parent_document = doc;
          });

          return documentPromise;
        });

        Promise.all(allDocPromises).then(() => {
          setDocParagraphResults(allParagraphs);

          if (process.env.DISABLE_SEMANTIC_HIGHLIGHT !== "true") {
            // fetch all highlights for results
            const matches = map(allParagraphs, 'text');
            const query = searchTerm;

            let url = `/api/dojo/paragraphs/highlight`;

            return axios.post(url, {
              query,
              matches
            }).then((response) => {
              setHighlights(response.data.highlights);
              return;
            });
          } else {
            console.info("Semantic Highlighter disabled.");
          }
        });
      })
      .finally(() => {
        setSearchLoading(false);
      });
  };

  useEffect(() => {
    performSearch();
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchTermValue('');
  };

  const handleSearchChange = ({ target: { value } }) => {
    // if we have no search term, clear everything
    if (value.length === 0) {
      clearSearch();
      return;
    }
    setSearchTermValue(value);
  };

  const displayableColumns = documentColumns;

  const openDocument = (doc) => {
    setOpenedDocument(doc);
  };

  const unselectDocument = () => {
    setOpenedDocument(null);
  };

  const onParagraphResultClick = (p) => {
    openDocument(p.parent_document);
  };

  const onDocumentRowClick = (docData) => {
    openDocument(docData.row);
  };

  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="lg"
    >
      <Typography
        variant="h3"
        align="center"
        paragraph
        style={{ marginBottom: '32px' }}
      >
        Document Explorer
      </Typography>

      {documentsError ? (
        <Typography align="center" variant="h6">
          Error loading documents.
        </Typography>
      ) : (
        <>
          <div className={classes.aboveTableWrapper}>
            <TextField
              style={{ width: "100%", maxWidth: "60rem" }}
              label="Enter query to perform Semantic Search through Documents"
              variant="outlined"
              value={searchTermValue}
              onChange={handleSearchChange}
              role="searchbox"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch}><CancelIcon /></IconButton>
                  </InputAdornment>
                )
              }}
            />
          </div>

          <br />

          {docParagraphResults?.length ? (
            <div>
              <Typography variant="h5">
                Top Matches ({docParagraphResults?.length})
              </Typography>

              {searchLoading && (
                <LinearProgress style={{ width: "90%" }} />
              )}

              {docParagraphResults.map((p, index) => (
                <ParagraphTile
                  onClick={onParagraphResultClick}
                  key={p.id}
                  paragraph={p}
                  highlights={get(highlights, `[${index}]`, null)}
                  query={searchTerm}
                />
              ))}
            </div>
          ) : (
            <>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
              >
                <Typography
                  variant="h5"
                >
                  All Documents
                </Typography>
                <Button
                  to="/documents/upload"
                  component={RouteLink}
                  variant="contained"
                  color="primary"
                  disableElevation
                >
                  Upload Documents
                </Button>
              </div>

              <br />

              <DataGrid
                autoHeight
                components={{
                  LoadingOverlay: CustomLoadingOverlay
                }}
                onRowClick={onDocumentRowClick}
                loading={documentsLoading || searchLoading}
                columns={displayableColumns}
                rows={documents?.results || []}
                pageSize={20}
                onPageChange={handlePageChange}
                paginationMode="server"
                rowCount={totalRowsCount}
              />
            </>
          )}

          <ViewDocumentDialog
            doc={openedDocument}
            onClose={unselectDocument}
          />
        </>
      )}

    </Container>
  );
});

export default ViewDocumentsGrid;
