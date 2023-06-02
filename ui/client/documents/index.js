import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';
import { format } from 'date-fns'

import Button from '@material-ui/core/Button';
import { GridOverlay, DataGrid } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import LinearProgress from '@material-ui/core/LinearProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import map from 'lodash/map';
import get from 'lodash/get';

import Container from '@material-ui/core/Container';

import { Link as RouteLink } from 'react-router-dom';

import ExpandableDataGridCell from '../components/ExpandableDataGridCell';
import { ViewDocumentDialog } from './ViewDocumentDialog';
import { ParagraphTile } from './ParagraphTile';

const expandableCell = ({ value, colDef }) => (
  <ExpandableDataGridCell
    value={value}
    width={colDef.computedWidth}
  />
);

const semanticSearchParagraphs = async (query) => {
  const url = `/api/dojo/paragraphs/search?query=${query}&size=40`;
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
    field: 'creation_date',
    headerName: 'Date Created',
    minWidth: 200,
  },
  {
    field: 'uploaded_at',
    headerName: 'Date Uploaded',
    minWidth: 200,
    renderCell: (params) => {
      if (params.value) {
        return <span>{format(params.value, 'yyyy-MM-dd')}</span>;
      }
    },
  },
  {
    field: 'publisher',
    headerName: 'Publisher',
    width: 200,
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
    renderCell: expandableCell
  },
];

/**
 * The root component for the document browser, rendering the page Container, DataGrid, and Dialog
 */
const ViewDocumentsGrid = withStyles(() => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem',
    marginTop: '1rem'
  },
  aboveTableWrapper: {
    display: 'flex',
    maxWidth: '100vw',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '1rem',
  }
}))(({ classes }) => {
  // use refs here to have references that won't trigger any rerenders
  const scrollIdRef = useRef(null);
  const cachedDocumentsRef = useRef({});

  // controlled grid page state so that we can manually reset it to 0 when the sort changes
  const [gridPage, setGridPage] = useState(0);
  const [documents, setDocuments] = useState(null);
  const [documentsError, setDocumentsError] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const fetchData = useCallback(
    // we use DataGrid's page index to maintain a cache for what DG should display
    // on each page of results. The API just uses a scroll_id and has no notion of this page
    async ({ page, column = 'creation_date', order = 'desc' }) => {
      setDocumentsLoading(true);
      setDocumentsError(null);
      // clear documents when loading so that we don't display the previous page
      // before loading the next set of results
      setDocuments(null);

      // check if data for the page is already in the cache
      if (cachedDocumentsRef.current[page]) {
        setDocuments(cachedDocumentsRef.current[page]);
        setGridPage(page);
        setDocumentsLoading(false);
      } else {
        try {
          const response = await axios.get(
            `/api/dojo/documents?size=100&sort_by=${column}&order=${order}${scrollIdRef.current ? `&scroll_id=${scrollIdRef.current}` : ''}`
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
          setGridPage(page);
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
    fetchData({ page: 0 });
  }, [fetchData]);

  // fetch the rows out of the cache for page 0 so that we maintain it even when we clear
  // documents state on page change, defaulting to 0 to prevent NaN in case we have no hits
  const totalRowsCount = Number(documents?.hits)
    || Number(cachedDocumentsRef.current[0]?.hits) || 0;

  const handlePageChange = (newPage) => {
    fetchData({ page: newPage });
  };

  const handleSortChange = (newSort) => {
    // clear the scrollId so the API doesn't think we are continuing a request
    scrollIdRef.current = null;
    // clear the cache so we don't try to reload previous results (that have a different sort)
    cachedDocumentsRef.current = {};
    // fetch the data & load it into the grid
    fetchData({ page: 0, column: newSort[0].field, order: newSort[0].sort });
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

          documentPromise.then((doc) => {
            allParagraphs[idx].parent_document = doc;
          });

          return documentPromise;
        });

        Promise.all(allDocPromises).then(() => {
          setDocParagraphResults(allParagraphs);

          if (process.env.DISABLE_SEMANTIC_HIGHLIGHT !== 'true') {
            // fetch all highlights for results
            const matches = map(allParagraphs, 'text');
            const query = searchTerm;

            const url = '/api/dojo/paragraphs/highlight';

            return axios.post(url, {
              query,
              matches
            }).then((response) => {
              setHighlights(response.data.highlights);
            });
          }
          console.info('Semantic Highlighter disabled.');
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
              style={{ width: '100%', maxWidth: '60rem' }}
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
                <LinearProgress style={{ width: '90%' }} />
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
                sortingOrder={['desc', 'asc']}
                page={gridPage}
                autoHeight
                components={{
                  LoadingOverlay: CustomLoadingOverlay
                }}
                onRowClick={onDocumentRowClick}
                loading={documentsLoading || searchLoading}
                columns={displayableColumns}
                rows={documents?.results || []}
                pageSize={100}
                onPageChange={handlePageChange}
                paginationMode="server"
                rowCount={totalRowsCount}
                disableColumnFilter
                sortingMode="server"
                onSortModelChange={handleSortChange}
                disableColumnMenu
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
