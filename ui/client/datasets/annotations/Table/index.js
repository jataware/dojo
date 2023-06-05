import React, { useRef, useState } from 'react';

import clsx from 'clsx';
import get from 'lodash/get';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import { withStyles } from '@material-ui/core/styles';
import { GridOverlay, DataGrid } from '@material-ui/data-grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import LinearProgress from '@material-ui/core/LinearProgress';
import InboxIcon from '@material-ui/icons/MoveToInbox';

import { groupColumns } from './helpers';
import BasicAlert from '../../../components/BasicAlert';
import ColumnPanel from '../ColumnPanel';
import Header from './Header';

import AnnotationDialog from './UploadAnnotationFileDialog';

const rowsPerPageOptions = [25, 50, 100];

const Cell = withStyles(({ palette, spacing }) => ({
  root: {
    marginLeft: -6,
    width: '115%',
    marginRight: -6,
    // NOTE How much to space cell content left. We can also use flex + center items
    paddingLeft: spacing(2),
    cursor: 'pointer',
  },
  hoveredCell: {
    backgroundColor: palette.grey[100],
  },
}))(({
  isHighlighted, classes, value
}) => (
  <span
    className={clsx({
      [classes.root]: true,
      [classes.hoveredCell]: isHighlighted,
    })}
  >
    {value}
  </span>
));

const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 80;

/**
 * Blue linear loading animation displayed when table loading/searching of
 * features is still in progress.
 */
function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <div style={{
        position: 'absolute', top: 0, width: '100%', zIndex: 15
      }}
      >
        <LinearProgress style={{ height: 3 }} />
      </div>
    </GridOverlay>
  );
}

export default withStyles(({ palette }) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  grid: {
    flex: '1 0 30rem',
    maxHeight: `${(ROW_HEIGHT * 15) + HEADER_HEIGHT + 10}px`,
  },
  row: {
    backgroundColor: `${palette.common.white} !important`
  },
  disabledEvents: {
    pointerEvents: 'none'
  },
  columnHeaderTitle: {
    padding: '0 4px !important',
  },
  hideHeaderBorder: {
    // hide the blue outline on the datagrid header when focused
    '& .MuiDataGrid-columnHeader': {
      '&:focus-within': {
        outline: 'none',
      }
    },
    '& .MuiDataGrid-cell': {
      '&:focus-within': {
        outline: 'none',
      }
    }
  },
  gridScroll: {
    '& *::-webkit-scrollbar': {
      width: 10,
      height: 10
    },
    // TODO add/use color values to theme
    '& *::-webkit-scrollbar-track': {
      backgroundColor: '#DDDDDD33'
    },
    '& *::-webkit-scrollbar-thumb': {
      backgroundColor: '#CCCCCC',
      borderRadius: 8
    }
  },
  tooltip: {
    fontSize: '1rem'
  },
  hideRightSeparator: {
    '& > .MuiDataGrid-columnSeparator': {
      visibility: 'hidden',
    },
  },
}), { name: 'TableAnnotation' })(({
  classes, annotateColumns, rows,
  columns, annotations, inferredData,
  loading, multiPartData, setMultiPartData,
  validateDateFormat, columnStats,
  fieldsConfig, addingAnnotationsAllowed, onUploadAnnotations, datasetID
}) => {
  const [pageSize, setPageSize] = useState(rowsPerPageOptions[0]);
  const [highlightedColumn, setHighlightedColumn] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [annotationSuccessAlert, setAnnotationSuccessAlert] = useState();
  const [annotationAlertMessage, setAnnotationAlertMessage] = useState({
    message: '',
    severity: 'success',
  });

  const [isUploadingAnnotations, setUploadingAnnotations] = useState(false);
  const [fileDictionaryError, setfileDictionaryError] = useState(null);
  const [dictionaryUploadLoading, setDictionaryUploadLoading] = useState(false);

  function cancelUploadAnnotations() {
    setUploadingAnnotations(false);
    setfileDictionaryError(null);
  }

  const [isShowMarkers, setShowMarkers] = useState(true);

  const isEditing = Boolean(editingColumn);

  const toggleDrawer = () => {
    setEditingColumn(!editingColumn);
  };

  const findMultipartMember = (columnFieldName) => (
    find(multiPartData, (mp) => mp.members.includes(columnFieldName))
  );

  const openAnnotationPanel = (cell) => {
    const isColumnAnnotated = !isEmpty(annotations[cell.field]);
    if (!isColumnAnnotated && !addingAnnotationsAllowed) {
      return;
    }

    const multiPartMember = find(
      multiPartData, (item) => item && item.members.includes(cell.field)
    );

    if (multiPartMember) {
      const { name } = multiPartMember;
      setEditingColumn({
        name,
        headerName: name
      });
    } else {
      setEditingColumn({
        name: cell.field,
        headerName: cell.field,
      });
    }
  };

  function calcColumnAttrs(columnFieldName) {
    const mpData = findMultipartMember(columnFieldName);
    const isMultiPartBase = get(mpData, 'baseColumn') === columnFieldName;
    const isMultiPartMember = Boolean(mpData);

    const isHighlighted = isMultiPartMember ? mpData.members.includes(highlightedColumn)
      : highlightedColumn === columnFieldName;

    const targetColumn = isMultiPartMember ? mpData.name : columnFieldName;
    const columnAnnotation = annotations[targetColumn];

    let status = 'default';

    if (get(inferredData, `${columnFieldName}.category`)) {
      status = 'inferred';
    }
    if (columnAnnotation) {
      status = 'annotated';
    }
    if (get(columnAnnotation, 'primary')) {
      status = 'primary';
    }

    return {
      isHighlighted,
      status,
      isMultiPartMember,
      isMultiPartBase,
      colSpan: mpData?.members?.length,
      category: columnAnnotation?.category,
      qualifies: columnAnnotation?.isQualifies,
    };
  }

  const sortedColumns = groupColumns(columns, multiPartData, annotations);

  const formattedColumns = sortedColumns
    .map((column) => ({
      ...column,

      flex: 1,
      minWidth: 200,
      sortable: false,
      disableReorder: true,
      // add this class to hide the vertical separators between the headers
      // we'll add it manually in the Header itself so that we can handle multiparts
      headerClassName: classes.hideRightSeparator,

      headerName: column.field,

      renderHeader: ({ colDef }) => (
        <Header
          addingAnnotationsAllowed={addingAnnotationsAllowed}
          showMarkers={isShowMarkers}
          {...calcColumnAttrs(colDef.field)}
          heading={colDef.headerName}
          column={column}
          buttonClick={openAnnotationPanel}
          isHighlighted={(colDef.field === highlightedColumn)}
          drawerOpen={Boolean(editingColumn)}
        />
      ),

      renderCell: ({ colDef, value }) => (
        <Cell
          {...calcColumnAttrs(colDef.field)}
          value={value}
        />
      )
    }));

  const gridRef = useRef(null);

  function onAnnotationSave(columnName) {
    setAnnotationSuccessAlert(true);
    setAnnotationAlertMessage({
      message: `Your annotation of ${columnName} was successfully added`, severity: 'success'
    });
  }

  const highlightColumn = (cell, event) => {
    // Get the next column to highlight from relatedTarget - this works for arrow key navigation
    const clicked = event.relatedTarget;
    if (clicked?.getAttribute('role') !== 'cell') {
      // only continue if the user has clicked on a 'cell'
      return;
    }

    // Fetch the column name out of the element's data-field attribute
    const nextHighlight = clicked.getAttribute('data-field');

    // and set our state to the column name, if it existed
    if (nextHighlight) setHighlightedColumn(nextHighlight);
  };

  const handleCellKeyDown = (cell, event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      // DataGrid's vertical scroll is only disabled with both stopPropagation and preventDefault
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Enter') {
      openAnnotationPanel(cell);
    }
  };

  const handleFileSelect = (acceptedFiles) => {
    setDictionaryUploadLoading(true);
    onUploadAnnotations(acceptedFiles[0])
      .then((success) => {
        cancelUploadAnnotations();

        if (success) {
          setAnnotationSuccessAlert(true);
          setAnnotationAlertMessage({
            message: 'Your annotations were successfully applied',
            severity: 'success'
          });
        }
      })
      .catch((e) => {
        setfileDictionaryError(e.message);
      })
      .finally(() => { setDictionaryUploadLoading(false); });
  };

  return (
    <div className={classes.root}>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Tooltip
            classes={{ tooltip: classes.tooltip }}
            title="Display context icons for columns with inferred data, annotated as primary, or as qualifier."
          >
            <FormControlLabel
              control={(
                <Checkbox
                  checked={isShowMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  color="primary"
                />
              )}
              label="Show Additional Markers"
            />
          </Tooltip>
        </div>

        {addingAnnotationsAllowed && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="primary"
              size="large"
              startIcon={<InboxIcon />}
              onClick={() => setUploadingAnnotations(true)}
            >
              Upload Data Dictionary
            </Button>
          </div>
        )}
      </div>

      <DataGrid
        ref={gridRef}
        loading={loading}
        disableColumnMenu
        disableSelectionOnClick
        getRowId={(row) => row.__id}
        components={{
          LoadingOverlay: CustomLoadingOverlay
        }}
        classes={{
          root: clsx([classes.grid, classes.gridScroll, classes.hideHeaderBorder]),
          row: classes.row,
          cell: clsx({ [classes.disabledEvents]: isEditing }),
          columnHeader: clsx({
            [classes.disabledEvents]: isEditing,
            [classes.columnHeaderTitle]: true,
          }),
        }}
        columns={formattedColumns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        headerHeight={HEADER_HEIGHT}
        rowsPerPageOptions={rowsPerPageOptions}
        rows={rows}
        onCellDoubleClick={openAnnotationPanel}
        onColumnHeaderDoubleClick={openAnnotationPanel}
        GridSortModel={null}
        onCellKeyDown={handleCellKeyDown}
        onCellBlur={highlightColumn}
        onCellClick={(cell) => setHighlightedColumn(cell.field)}
      />

      <ColumnPanel
        onClose={toggleDrawer}
        onSubmit={onAnnotationSave}

        columns={formattedColumns}
        columnName={editingColumn?.name}
        headerName={editingColumn?.headerName}
        columnStats={columnStats}

        annotations={annotations}
        annotateColumns={annotateColumns}
        inferredData={get(inferredData, editingColumn?.name)}
        validateDateFormat={validateDateFormat}

        multiPartData={multiPartData}
        setMultiPartData={setMultiPartData}

        fieldsConfig={fieldsConfig}
      />

      <BasicAlert
        alert={annotationAlertMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        visible={annotationSuccessAlert}
        setVisible={setAnnotationSuccessAlert}
      />

      <AnnotationDialog
        open={isUploadingAnnotations}
        handleClose={cancelUploadAnnotations}
        handleFileSelect={handleFileSelect}
        errorMessage={fileDictionaryError}
        clearErrorMessage={() => { setfileDictionaryError(null); }}
        loading={dictionaryUploadLoading}
        datasetID={datasetID}
      />
    </div>
  );
});
