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
import CancelIcon from '@material-ui/icons/Cancel';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Container from '@material-ui/core/Container';

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
  let url = `/api/dojo/paragraphs/search?query=${query}`;
  const response = await axios.get(url);
  return response.data;
};

const semanticSearchDocuments = async(query) => {
  let url = `/api/dojo/documents/search?query=${query}`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * Adapted from ViewModels.js::fetchModels
 */
const fetchFeatures = async (
  setFeatures, setParagraphsLoading, setFeaturesError, searchTerm, scrollId
) => {
  setParagraphsLoading(true);

  let url = `/api/dojo/features`;
  if (scrollId) {
    url += `?scroll_id=${scrollId}`;
  } else if (searchTerm) {
    url += `?term=${searchTerm}`;
  }

  const featuresRequest = axios.get(url).then(
    (response) => {
      const featuresData = response.data;
      return featuresData;
    }
  );

  let preparedFeatures = null;
  let hitFeatureCountThreshold = false;

  preparedFeatures = featuresRequest.then((featuresData) => {

    setFeatures((prev) => {

      if (prev.length > 100) { // TODO 100 for now
        hitFeatureCountThreshold = true;
      }

      return !scrollId ? featuresData.results : prev.concat(featuresData.results);
    });

    return [featuresData.scroll_id, featuresData.results];
  });

  preparedFeatures.then(([ newScrollId, results ]) => {

    // when there's no scroll id, we've hit the end of the results
    if (newScrollId && !hitFeatureCountThreshold) {
      // if we get a scroll id back, there are more results
      // so call fetchModels again to fetch the next set
      fetchFeatures(setFeatures, setParagraphsLoading, setFeaturesError, searchTerm, newScrollId);
    } else {
      setParagraphsLoading(false);
    }
  });

  preparedFeatures.catch((error) => {
    console.log('error:', error);
    setFeaturesError(true);
  });
};

const fetchSurroundingParagraphs = async (documentId, paragraphId) => {

  const indexId = Number(paragraphId.match(/[0-9]+$/g));

  let baseUrl = `/api/dojo/paragraphs`;

  // TODO rename urls to pids (paragraph ids)
  const urls = [];

  if (indexId > 0) {
    urls.push(indexId - 1);
  }
  urls.push(indexId);
  urls.push(indexId + 1);

  if (indexId === 0) {
    urls.push(indexId + 2);
  }

  const allIds = urls.map(p => `${documentId}-${p}`);
  const urlsToUse = allIds.map(id => `${baseUrl}/${id}`);

  // TODO paragraph might be last of doc! need to handle promise.all individually first,
  // then await for all to properly resolve subset of successful responses.
  const p = Promise
        .all([axios.get(`/api/dojo/documents/${documentId}`), ...urlsToUse.map(u => axios.get(u))])
        .then(responses => {
          console.log("all doc, p responses:", responses);

          const [ docInfo, ...pInfo ] = responses.map(r => r.data);
          const docText = pInfo.map(pp => pp.text);

          docInfo.text = docText;

          console.log("docInfo", docInfo);

          return docInfo;
        });

  return p;
};

const fetchParagraphs = async (
  setParagraphs, setParagraphsLoading, setParagraphsError, scrollId
) => {
  setParagraphsLoading(true);

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
      fetchParagraphs(setParagraphs, setParagraphsLoading, setParagraphsError, newScrollId);
    } else {
      setParagraphsLoading(false);
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
    // flex: 1
  },
  {
    field: 'title',
    headerName: 'Title',
    flex: 1
  },
  // {
  //   field: 'creation_date',
  //   headerName: 'Created Date',
  //   renderCell: expandableCell,
  //   // minWidth: 200,
  //   // flex: 1
  // },
  {
    field: 'publisher',
    headerName: 'Publisher',
    // renderCell: expandableCell,
    width: 200,
    // flex: 1
  },
  {
    field: 'description',
    headerName: 'Description',
    renderCell: expandableCell,
    // minWidth: 200,
    flex: 2
  }
];

/**
 *
 **/
export const ViewDocumentDialog = ({doc, onClose}) => {

  const document = doc || {};

  return (
    <Dialog
      open={Boolean(doc)}
      onClose={onClose}
      maxWidth="md"
    >
      <DialogTitle>{document.title}</DialogTitle>

      <DialogContent>

        {!isEmpty(doc) && (
          <dl>
            {["publisher", "creation_date", "title"].map(item => document[item] ? (
            <>
              <dt>{startCase(item)}</dt>
              <dd>{document[item]}</dd>
            </>
          ) : null)}
        </dl>
        )}

        <DialogContentText>
          {document?.text?.length && (
            <>
              <Typography variant="body1">Excerpt</Typography>
              {document.text.map(tip => (
                <p>{tip}</p>
              ))}
            </>
          )}
        </DialogContentText>
      </DialogContent>

    </Dialog>
  );

}

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
    width: "2rem",
    display: "flex",
    justifyContent: "center"
  }
}))(({classes, paragraph, highlights, onClick}) => {

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

          <div>
            <dt>
              <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="text" />
            </dt>
            <dd>{highlightText(paragraph.text, highlights)}</dd>
          </div>
        </dl>

        <div style={{display: "flex"}}>
          <Chip classes={{root: classes.squareChip, label: classes.chipLabel}} label="Hit%" />
          <div style={{display: "block", width: "8rem"}}>
            <ConfidenceBar
              value={Math.sqrt(paragraph.score) * 100}
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
  const [paragraphsLoading, setParagraphsLoading] = useState(false);

  // TODO rename doc results
  const [docResults, setDocResults] = useState(null);

  const [openedDocument, setOpenedDocument] = useState(null);

  // TODO unalias this and use scrollId... also create a placeholder to catch results
  const { documents: documentsData, documentsLoading, documentsError } = useDocuments();

  const documents = documentsData?.results;

  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

  const performSearch = () => {
    // TODO

    if (!searchTerm) {
      setDocResults(null);
      return;
    }

    console.log('search term:', searchTerm);

    setParagraphsLoading(true);

    semanticSearchParagraphs(searchTerm)
      .then((results) => {
        console.log('results', results);
        setDocResults(results.results);
      })
      .finally(() => {
        setParagraphsLoading(false);
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

  // const openDocument = identity; // TODO open dialog with doc data

  const openDocument = (doc) => {
    setOpenedDocument(doc);
  };

  const unselectDocument = () => {
    setOpenedDocument(null);
  };

  const onParagraphResultClick = (p) => {
    console.log("selected p", p);

    setParagraphsLoading(true);

    fetchSurroundingParagraphs(p.document_id, p.id)
      .then(extractedDocData => {
        console.log("extracted doc data:", extractedDocData);
        openDocument(extractedDocData);
      })
      .finally(()=> {setParagraphsLoading(false);});
  };

  return documentsError ? (
    <Typography>
      Error loading documents.
    </Typography>
  ) : (
    <Container
      className={classes.root}
      component="main"
      maxWidth="xl"
    >
      <Typography
        className={classes.header}
        component="h3"
        variant="h4"
        align="center"
        paragraph
      >
        Document Explorer
      </Typography>
      <div className={classes.aboveTableWrapper}>
        <div>
          <TextField
            label="Search Documents"
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
        {!docResults && (
          <Alert
            variant="outlined"
            severity="info"
            style={{border: 'none'}}
          >
            Click on a row, then CTRL+C or CMD+C to copy contents.
          </Alert>
        )}
      </div>

      <ViewDocumentDialog
        doc={openedDocument}
        onClose={unselectDocument}
      />

      {docResults?.length ? (
        <div>
          {paragraphsLoading && (
              <LinearProgress style={{width: "90%"}} />
          )}
          {docResults.map(p => (
            <ParagraphTile
              onClick={onParagraphResultClick}
              key={p.id}
              paragraph={p}
              highlights={searchTerm}
            />
          ))}
        </div>
      ) : (
        <DataGrid
          autoHeight
          components={{
            LoadingOverlay: CustomLoadingOverlay,
            Pagination: CustomTablePagination
          }}
          loading={documentsLoading || paragraphsLoading}
          columns={displayableColumns}
          rows={documents || []}
        />

      )}
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
  const [paragraphsLoading, setParagraphsLoading] = useState(false);

  const { documents, documentsLoading, documentsError } = useDocuments();

  console.log("documents", documents);

  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

  // useEffect(() => {
  //   performSearch();
  // }, [searchTerm]);

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
        className={classes.header}
        component="h3"
        variant="h4"
        align="center"
      >
        Document Explorer
      </Typography>
      <div className={classes.aboveTableWrapper}>
        <div>
          <TextField
            label="Search Documents"
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

      {/* <div> */}
      {/*   {paragraphs.map(p => ( */}
      {/*     <ParagraphTile paragraph={p} /> */}
      {/*   ))} */}
      {/* </div> */}

    </Container>
  );
});


export default ViewDocumentsGrid;
