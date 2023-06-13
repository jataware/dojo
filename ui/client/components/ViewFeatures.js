import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';
import identity from 'lodash/identity';

import Button from '@material-ui/core/Button';
import { GridOverlay, DataGrid } from '@material-ui/data-grid';
// useGridSlotComponentProps
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import ExpandableDataGridCell from './ExpandableDataGridCell';

const expandableCell = ({ value, colDef }) => (
  <ExpandableDataGridCell
    value={value}
    width={colDef.computedWidth}
  />
);

const MATCH_TYPE = {
  semantic: 'semantic',
  hybrid: 'hybrid'
};

/**
 * Maytch % confidence bar
 **/
export const ConfidenceBar = withStyles(() => ({
  root: {
    height: 15,
  },
  colorPrimary: {
    border: '1px solid gray',
    backgroundColor: 'transparent',
    background: 'repeating-linear-gradient( -45deg, gray, gray 1px, white 1px, white 4px )'
  },
  bar: { // keyword matches
    backgroundColor: 'rgb(111,216,250)',
  },
  hybridBar: {
    backgroundColor: 'rgb(111,216,250)',
  },
  semanticBar: {
    backgroundColor: 'rgb(142,114,233)' // rgb(68,81,225)
  }
}))(({ matchType, classes, ...props }) => {
  let overrides = {};

  const { semanticBar, hybridBar, ...supportedClasses } = classes;

  if (matchType === MATCH_TYPE.semantic) {
    overrides = { bar: semanticBar };
  } else if (matchType === MATCH_TYPE.hybrid) {
    overrides = { bar: hybridBar };
  }

  return (
    <LinearProgress
      {...props}
      classes={{
        ...supportedClasses,
        ...overrides
      }}
    />
  );
});

const semanticSearchFeatures = async (query) => {
  const url = `/api/dojo/features/search?query=${query}&size=50`;
  const response = await axios.get(url);
  return response.data;
};

/**
 * Adapted from ViewModels.js::fetchModels
 */
const fetchFeatures = async (
  setFeatures, setFeaturesLoading, setFeaturesError, scrollId
) => {
  setFeaturesLoading(true);

  let url = '/api/dojo/features?size=2000';
  if (scrollId) {
    url += `&scroll_id=${scrollId}`;
  }

  const featuresRequest = axios.get(url).then(
    (response) => {
      const featuresData = response.data;
      return featuresData;
    }
  );

  featuresRequest.then((featuresData) => {
    setFeatures((prev) => (!scrollId ? featuresData.results : prev.concat(featuresData.results)));
  })
    .catch((error) => {
      console.log('error:', error);
      setFeaturesError(true);
    })
    .finally(() => {
      setFeaturesLoading(false);
    });
};

/**
 * Uses internal DataGrid API to:
 * a) Decide if we should display "Many" for features count
 * b) Wire and display the rest of the labels that are usually
 *    set for us when we don't need custom behavior.
 */
// Reverted Many count per implementation changes.
// Leaving CustomTablePagination in to assess action after feedback.
// const CustomTablePagination = (props) => {
//   const { state, apiRef } = useGridSlotComponentProps();

//   return (
//     <TablePagination
//       labelDisplayedRows={({ from, to, count }) => {
//         // const displayCount = count > 500 ? 'Many' : count;
//         const displayCount = count;
//         return `${from}-${to} of ${displayCount}`;
//       }}
//       {...props}
//       page={state.pagination.page}
//       onPageChange={(event, value) => apiRef.current.setPage(value)}
//       rowsPerPage={100}
//       count={state.pagination.rowCount}
//     />
//   );
// };

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
const Legend = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{
      width: 14, height: 14, backgroundColor: color, display: 'block', border: 'darkgray'
    }}
    />
      &nbsp;
    <span>{label}</span>
  </div>
);

/**
 *
 */
const ViewFeatures = withStyles(() => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  aboveTableWrapper: {
    display: 'flex',
    maxWidth: '100vw',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  }
}))(({ classes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermValue, setSearchTermValue] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateSearchTerm = useCallback(debounce(setSearchTerm, 500), []);

  const [features, setFeatures] = useState([]);
  const [featuresError, setFeaturesError] = useState(false);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  const [maxSearchScore, setMaxSearchScore] = useState(1);

  const featureColumns = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      flex: 1
    },
    {
      field: 'display_name',
      headerName: 'Display Name',
      renderCell: expandableCell,
      minWidth: 200,
      flex: 1
    },
    {
      field: 'description',
      headerName: 'Description',
      renderCell: expandableCell,
      minWidth: 200,
      flex: 1
    },
    {
      field: 'match_score',
      headerName: 'Match %',
      renderCell: (rowParent) => {
        const matchScore = rowParent?.row?.metadata?.match_score;
        if (!matchScore) {
          return null;
        }

        const isHybridSemanticResult = maxSearchScore > 1 && matchScore <= 1;

        const isSemanticResult = maxSearchScore < 1;

        const maxScore = isHybridSemanticResult ? 1.3 : isSemanticResult ? 1 : maxSearchScore;

        const op = isSemanticResult || isHybridSemanticResult ? Math.sqrt : identity;

        const value = op(matchScore / maxScore) * 100;

        const matchArray = rowParent?.row?.metadata?.matched_queries;

        let matchType = 'keyword';

        if (matchArray.length === 1 && matchArray.includes('semantic_search')) {
          matchType = MATCH_TYPE.semantic;
        } else if (matchArray.length > 1 && matchArray.includes('semantic_search')) {
          matchType = MATCH_TYPE.hybrid;
        }

        return (
          <div style={{ width: '100%' }}>
            <ConfidenceBar
              matchType={matchType}
              value={value}
              variant="determinate"
            />
          </div>
        );
      },
      disableColumnMenu: true,
      width: 130,
    },
    {
      field: 'owner_dataset_name',
      headerName: 'Dataset Name',
      valueGetter: (cell) => cell.row.owner_dataset.name,
      minWidth: 200,
      flex: 1
    },
    {
      field: 'link',
      headerName: ' ',
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <Button
          component="a"
          href={`/dataset_summary?dataset=${row.owner_dataset.id}`}
          target="_blank"
          variant="outlined"
        >
          Parent Dataset
          <OpenInNewIcon />
        </Button>
      ),
      minWidth: 210,
    }
  ];

  const performSearch = () => {
    if (!searchTerm) {
      fetchFeatures(setFeatures, setFeaturesLoading, setFeaturesError);
      return;
    }

    setFeaturesLoading(true);
    semanticSearchFeatures(searchTerm)
      .then((newFeatures) => {
        setMaxSearchScore(newFeatures.max_score);
        setFeatures(newFeatures.results);
      })
      .finally(() => {
        setFeaturesLoading(false);
      });
  };

  useEffect(() => {
    performSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    updateSearchTerm(value);
  };

  return featuresError ? (
    <Typography>
      Error loading features.
    </Typography>
  ) : (
    <div className={classes.root}>
      <div className={classes.aboveTableWrapper}>
        <div>
          <TextField
            label="Search Features"
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
        {Boolean(searchTerm) && (
          <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'bottom' }}>
            <Typography variant="h6">Match Legend</Typography>
            &nbsp;
            &nbsp;
            <Legend color="rgb(111,216,250)" label="Keyword" />
            &nbsp;
            &nbsp;
            <Legend color="rgb(142,114,233)" label="Semantic" />
          </div>
        )}
      </div>

      <DataGrid
        autoHeight
        components={{
          LoadingOverlay: CustomLoadingOverlay
        }}
        loading={featuresLoading}
        getRowId={(row) => `${row.owner_dataset.id}-${row.name}`}
        columns={featureColumns}
        rows={features}
      />
    </div>
  );
});

export default ViewFeatures;
