import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import random from 'lodash/random';
import keyBy from 'lodash/keyBy';
import reduce from 'lodash/reduce';

import { GridOverlay, DataGrid } from '@material-ui/data-grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';

import MuiAlert from '@material-ui/lab/Alert';

import Autocomplete from '../../components/Autocomplete';



const gadmResolverColumns = [
  {
    id: 'raw_value',
    label: 'Raw Value',
    minWidth: 25,
  },
  {
    id: 'gadm_resolved',
    label: 'GADM Resolved',
    minWidth: 50,
  }
];

/**
 *
 **/
const GadmResolverTable = withStyles(() => ({
  table: {
    maxHeight: '100%'
  },
  tableHeader: {
  },
  tableHeaderCell: {
    backgroundColor: '#f0f8ff',
    padding: '1rem',
  },
  tableCell: {
    padding: '0.8rem',
    borderColor: 'aliceblue',
  },
  tableRow: {
  },
  selectRoot: {
    width: '100%'
  },
  outlined: {
    borderRadius: 0,
    width: '100%'
  },
  innerInputOutlined: {
    padding: 10
  }
}))(({classes, rows, gadmValues, onGadmChange, countries }) => {

  return (
    <Table
      className={classes.table}
      aria-label="Gadm Resolver Table"
      stickyHeader
    >
      <TableHead>
        <TableRow className={classes.tableHeader}>
          {gadmResolverColumns.map((column) => (
            <TableCell
              className={classes.tableHeaderCell}
              key={column.id}
              align={column.align}
              style={{ minWidth: column.minWidth }}
            >
              <Typography
                variant="h5"
                style={{fontSize: '1.1rem'}}
              >
                {column.label}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          return (
            <TableRow
              className={classes.tableRow}
              hover
              role="checkbox"
              tabIndex={-1}
              key={row.raw_value}
            >
              <TableCell className={classes.tableCell}>
                {row.raw_value}
              </TableCell>

              <TableCell className={classes.tableCell}>
                <Autocomplete
                  multiple={false}
                  options={[...row.alternatives, ...countries.filter(c => !row.alternatives.includes(c))]}
                  values={
                    gadmValues[row.raw_value].override || row.gadm_resolved
                  }
                  setValues={(newValue) => onGadmChange(row.raw_value, newValue)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
 });

/**
 *
 **/
export const GadmResolver = withStyles(() => ({
  root: {
    maxWidth: "40rem",
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  tableFlexer: {
    marginTop: '0.25rem',
    flex: 1,
    position: 'relative',
    width: '100%'
  },
  tableFlexerAutoHeight: {
    display: 'block',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  tableContainer: {
    border: '1px solid rgba(224, 224, 224, 1)',
    width: '100%',
    maxHeight: '100%',
    overflowY: 'auto'
  },
  row: {
    cursor: 'pointer'
  },
  alert: {
    backgroundColor: 'white',
    alignItems: 'center',
  }
}))(({ classes, gadmRowData, onSave, onCancel, overrides, countries }) => {

  const lowConfidenceRows = gadmRowData.fuzzy_match;
  const primaryField = gadmRowData.field;

  const formattedOverrides = overrides ? overrides[primaryField] : {};

  const gadmRowsKeyed = keyBy(lowConfidenceRows, 'raw_value');

  const addOverrides = (gadmRowsKeyedObject, savedOverrides) => {
    Object.keys(savedOverrides).forEach((country_name, idx) => {
      gadmRowsKeyedObject[country_name].override = savedOverrides[country_name];
    });

    return gadmRowsKeyedObject;
  };

  const [gadmResolutionValues, setGadmResolutionValues] = React.useState(addOverrides(gadmRowsKeyed, formattedOverrides));

  const updateGadmResolutionValues = (rawCountryName, newSelection) => {
    setGadmResolutionValues(prev => ({
      ...prev,
      [rawCountryName]: {
        ...prev[rawCountryName],
        override: newSelection
      }
    }));
  };

  const handleSave = () => {
    const formatted = reduce(gadmResolutionValues, (acc, value, key) => {

      if (value.override) {
        acc[key] = value.override;
      }

      return acc;

    }, {});

    onSave({[primaryField]: formatted});
  };

  return (
      <div
        className={classes.root}
        style={{ minHeight: 500 }}
      >

        <div>
          <Typography variant="h5" gutterBottom>
            Review Administrative Area Detection
          </Typography>

          <MuiAlert
            classes={{standardInfo: classes.alert}}
            severity="info"
          >
            The following GADM mappings for primary country <span style={{color: '#2488ff', backgroundColor: '#f1f1f1', padding: 2}}>{primaryField}</span> have been identified with lower confidence. Adjust as needed.
          </MuiAlert>
        </div>

        <div className={classes.tableFlexer}>
          <div className={classes.tableFlexerAutoHeight}>
            <Paper
              className={classes.tableContainer}
              elevation={0}
              >
              <GadmResolverTable
                countries={countries.gadm_entries}
                rows={lowConfidenceRows}
                onGadmChange={updateGadmResolutionValues}
                gadmValues={gadmResolutionValues}
              />
            </Paper>
          </div>
        </div>

        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
          <div
            style={{
              textAlign: 'right',
              padding: '1.5rem 0 0.5rem 0',
              width: '12rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              color="default">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="outlined"
              type="submit"
              color="primary">
              Save
            </Button>
          </div>
        </div>

      </div>
  );
});