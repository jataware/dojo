import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';
import identity from 'lodash/identity';

import Button from '@material-ui/core/Button';
import { GridOverlay, DataGrid, useGridSlotComponentProps } from '@material-ui/data-grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TablePagination from '@material-ui/core/TablePagination';
import Alert from '@material-ui/lab/Alert';

import ExpandableDataGridCell from './ExpandableDataGridCell';
import LoadingOverlay from './LoadingOverlay';

import LinearProgress from '@material-ui/core/LinearProgress';
import CancelIcon from '@material-ui/icons/Cancel';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';



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

const semanticSearchFeatures = async(query) => {
  let url = `/api/dojo/features/search?query=${query}&size=50`;
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

  let url = `/api/dojo/features?size=2000`;
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
    setFeatures((prev) => {
      return !scrollId ? featuresData.results : prev.concat(featuresData.results);
    });
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
const CustomTablePagination = props => {

  const { state, apiRef } = useGridSlotComponentProps();

  return (
    <TablePagination
      labelDisplayedRows={({from, to, count}) => {
        // const displayCount = count > 500 ? 'Many' : count;
        const displayCount = count;
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

/**
 *
 */
const ViewFeatures = withStyles((theme) => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
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

        const isSemanticResult = maxSearchScore > 1 && matchScore < 1;

        let maxScore =  isSemanticResult ? 1 : maxSearchScore;
        let op = isSemanticResult ? Math.sqrt : identity;

        const value = op(matchScore/maxScore) * 100;

        return (
          <div style={{width: '100%'}}>
            <ConfidenceBar
              value={value}
              variant='determinate'
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
          component='a'
          href={`/dataset_summary?dataset=${row.owner_dataset.id}`}
          target='_blank'
          variant='outlined'
        >
          Parent Dataset
          <OpenInNewIcon />
        </Button>
      ),
      minWidth: 210,
    }
  ];


  useEffect(() => {
    updateSearchTerm(searchTermValue);
  }, [searchTermValue]);

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
        <Alert
          variant="outlined"
          severity="info"
          style={{border: 'none'}}
        >
          Click on a row, then CTRL+C or CMD+C to copy contents.
        </Alert>
      </div>

      <DataGrid
        autoHeight
        components={{
          LoadingOverlay: CustomLoadingOverlay,
          Pagination: CustomTablePagination
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
