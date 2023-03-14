import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';

import Button from '@material-ui/core/Button';
import { GridOverlay, DataGrid, useGridSlotComponentProps } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TablePagination from '@material-ui/core/TablePagination';
import Alert from '@material-ui/lab/Alert';

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
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';

import { Link as RouteLink } from 'react-router-dom';

import { useDocuments } from "../components/SWRHooks";
import { highlightText } from "./utils";

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
 * Uses internal DataGrid API to:
 * a) Decide if we should display "Many" for features count
 * b) Wire and display the rest of the labels that are usually
 *    set for us when we don't need custom behavior.
 */
const CustomTablePagination = props => {

  const { state, apiRef } = useGridSlotComponentProps();

  return (
    <TablePagination
      labelDisplayedRows={({from, to, count}) => {
        const displayCount = count > 500 ? 'Many' : count;
        return `${from}-${to} of ${displayCount}`;
      }}
      {...props}
      page={state.pagination.page}
      onPageChange={(event, value) => {
        return apiRef.current.setPage(value);
      }}
      rowsPerPage={100}
      count={state.pagination.rowCount}
    />
  );
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

const SEARCH_MODE = {
  KEYWORD: 'KEYWORD',
  SEMANTIC: 'SEMANTIC'
};

const paragraphColumns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1
    },
    {
      field: 'text',
      headerName: 'Content Text',
      renderCell: expandableCell,
      minWidth: 200,
      flex: 3
    },
    {
      field: 'document_id',
      headerName: 'Document ID',
      renderCell: expandableCell,
      minWidth: 200,
      flex: 1
    },
  ];

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
}))(({classes, paragraph, highlights=null, onClick}) => {

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
            <dd>{highlights ?
                 highlights.map((partInfo, idx) => (
                   <span
                     key={idx}
                     style={partInfo.highlight ?
                            {fontWeight: 'bold', background: 'yellow'} :
                            {}}
                   >
                     {partInfo.text}
                   </span>
                 ))
                 : paragraph.text}</dd>
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
const ViewDocumentsGrid = withStyles((theme) => ({
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
}))(({classes}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermValue, setSearchTermValue] = useState('');
  const updateSearchTerm = useCallback(debounce(setSearchTerm, 1000), []);

  const [searchLoading, setSearchLoading] = useState(false);
  const [docParagraphResults, setDocParagraphResults] = useState(null);
  const [highlights, setHighlights] = useState(null);

  const [openedDocument, setOpenedDocument] = useState(null);

  // TODO unalias this and use scrollId... also create a placeholder to catch results
  const { documents: documentsData, documentsLoading, documentsError } = useDocuments();

  const documents = documentsData?.results;

  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

  const performSearch = () => {
    if (!searchTerm) {
      setDocParagraphResults(null);
      return;
    }

    setSearchLoading(true);

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

          // fetch all highlights for results
          const matches = map(allParagraphs, 'text');
          const query = searchTerm;

          let url = `/api/dojo/paragraphs/highlight`;

          return axios.post(url, {
            query,
            matches
          })
            .then((response) => {
              setHighlights(response.data.highlights)
              return;
            })

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

  return documentsError ? (
    <Typography>
      Error loading documents.
    </Typography>
  ) : (
    <Container
      className={classes.root}
      component="main"
      maxWidth="lg"
    >
      <Typography
        variant="h3"
        align="center"
        paragraph
      >
        Document Explorer
      </Typography>

      <br />

      <div className={classes.aboveTableWrapper}>
          <TextField
            style={{width: "100%", maxWidth: "60rem"}}
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
              <LinearProgress style={{width: "90%"}} />
          )}

          {docParagraphResults.map((p, index) => (
            <ParagraphTile
              onClick={onParagraphResultClick}
              key={p.id}
              paragraph={p}
              highlights={get(highlights, `[${index}]`, null)}
            />
          ))}
        </div>
      ) : (
        <>
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Typography
              variant="h5"
            >
              All Documents
            </Typography>
            <Button
              to="/documents/upload"
              component={RouteLink}
              variant="contained"
              color="primary">
              Upload Documents
            </Button>
          </div>

          <br />

          <DataGrid
            autoHeight
            components={{
              LoadingOverlay: CustomLoadingOverlay,
              Pagination: CustomTablePagination
            }}
            onRowClick={onDocumentRowClick}
            loading={documentsLoading || searchLoading}
            columns={displayableColumns}
            rows={documents || []}
          />
        </>
      )}

      <ViewDocumentDialog
        doc={openedDocument}
        onClose={unselectDocument}
      />

    </Container>
  );
});

/**
 *
 */
export const ParagraphListings = withStyles((theme) => ({
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  }
}))(({classes}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermValue, setSearchTermValue] = useState('');
  const updateSearchTerm = useCallback(debounce(setSearchTerm, 500), []);

  const [paragraphs, setParagraphs] = useState([]);
  const [paragraphsError, setParagraphsError] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const { documents, documentsLoading, documentsError } = useDocuments();

  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

  const performSearch = () => {
      fetchParagraphs(setParagraphs, setSearchLoading, setParagraphsError, searchTerm);
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

  const displayableColumns = paragraphColumns;

  return paragraphsError ? (
    <Typography>
      Error loading paragraphs.
    </Typography>
  ) : (
    <Container
      className={classes.root}
      component="main"
      maxWidth="xl"
    >
      <Typography
        variant="h4"
        align="center"
      >
        All Paragraphs
      </Typography>
      <div className={classes.aboveTableWrapper}>
        <div>
          <TextField
            label="Search Paragraphs"
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
      </div>

      <DataGrid
        autoHeight
        components={{
          LoadingOverlay: CustomLoadingOverlay,
          Pagination: CustomTablePagination
        }}
        loading={searchLoading}
        columns={displayableColumns}
        rows={paragraphs || []}
      />

    </Container>
  );
});


export default ViewDocumentsGrid;
