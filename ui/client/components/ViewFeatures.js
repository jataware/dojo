import React, { useEffect, useState, useCallback } from 'react';

import axios from 'axios';
import debounce from 'lodash/debounce';

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

/**
 * Adapted from ViewModels.js::fetchModels
 */
const fetchFeatures = async (
  setFeatures, setFeaturesLoading, setFeaturesError, searchTerm, scrollId
) => {
  setFeaturesLoading(true);

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

      if (prev.length > 500) {
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
      fetchFeatures(setFeatures, setFeaturesLoading, setFeaturesError, searchTerm, newScrollId);
    } else {
      setFeaturesLoading(false);
    }
  });

  preparedFeatures.catch((error) => {
    console.log('error:', error);
    setFeaturesError(true);
  });
};

/**
 *
 */
const CustomTablePagination = props => {

  const { state, apiRef } = useGridSlotComponentProps();

  return (
    <TablePagination
      labelDisplayedRows={({from, to, count}) => {
        const displayCount = count > 500 ? "Many" : count;
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
 *
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
    display: "flex",
    flexDirection: "column"
  },
  aboveTableWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
}))(({classes}) => {

  const [featuresSearchTerm, setFeaturesSearchTerm] = useState('');
  const [featuresSearchTermValue, setFeaturesSearchTermValue] = useState('');

  const updateFeaturesSearchTerm = useCallback(debounce(setFeaturesSearchTerm, 500), []);

  const [features, setFeatures] = useState([]);
  const [featuresError, setFeaturesError] = useState(false);
  const [featuresLoading, setFeaturesLoading] = useState(false); // Loading unused for now.

  useEffect(() => {
      fetchFeatures(setFeatures, setFeaturesLoading, setFeaturesError, featuresSearchTerm);
  }, [featuresSearchTerm]);

  const clearFeaturesSearch = () => {
    setFeaturesSearchTerm('');
    setFeaturesSearchTermValue('');
  };

  const handleFeatureSearchChange = ({ target: { value } }) => {
    // if we have no search term, clear everything
    if (value.length === 0) {
      clearFeaturesSearch();
      return;
    }
    setFeaturesSearchTermValue(value);
    updateFeaturesSearchTerm(value);
  };

  return featuresError ? (
    <Typography>
      Error loading features.
    </Typography>
  ) : (
    <div className={classes.root}>
      <div className={classes.aboveTableWrapper}>
        <TextField
          style={{
            width: '400px',
            marginRight: 16,
          }}
          label="Filter Features"
          variant="outlined"
          value={featuresSearchTermValue}
          onChange={handleFeatureSearchChange}
          role="searchbox"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={clearFeaturesSearch}><CancelIcon /></IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
      <Alert
        variant="outlined"
        severity="info"
        style={{border: "none"}}
      >
        Click on a row, then CTRL+C or CMD+C to copy contents.
      </Alert>
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
