import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import random from 'lodash/random';
import rcountry from 'random-country'; // TODO remove package dependency and this

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


const columns = [
  {
    field: 'raw_value',
    headerName: 'Raw Value',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'gadm_resolved',
    headerName: 'GADM Resolved',
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'adjusted',
    headerName: 'User Adjusted',
    // renderCell: expandableCell,
    flex: 1
  }
];

const AdjustGadmDialog = ({ open, onClose }) => {

  // value={}
  // onChange={}

  const mockCountry = rcountry({full: true})
  const mockRaw = mockCountry.replace('e', '').replace('a', 'i');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
    >
      <DialogTitle
        disableTypography
        style={{
          color:"white",
          backgroundColor: '#06B8EF',
          backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
          paddingBottom: "1rem"
        }}>
        <Typography variant="h5">
          Manual GADM Adjustment
        </Typography>
      </DialogTitle>

      <DialogContent>
        <div style={{width: "80%", padding: "1rem"}}>

          <table>
            <tbody>
              <tr>
                <td><Typography component="span" color="textSecondary">Raw Value</Typography></td>
                <td><Typography component="span" >{mockRaw}</Typography></td>
              </tr>
              <tr>
                <td><Typography component="span" color="textSecondary">GADM Resolved</Typography></td>
                <td><Typography component="span" style={{fontWeight: "bold"}}>{mockCountry}</Typography></td>
              </tr>
            </tbody>
          </table>

          <br />

        <TextField
          select
          label="GADM Alternatives"
          SelectProps={{
            native: true,
          }}
          helperText="Override the auto-detected GADM resolved by our system."
        >
          {Array(10).fill(0).map((option) => (
            <option key={random(1,15000)} value={option}>
              {rcountry({full: true})}
            </option>
          ))}
        </TextField>
          </div>

      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          color="default">
          Cancel
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          type="submit"
          color="primary">
          Save
        </Button>
      </DialogActions>

    </Dialog>
  );
};



/**
 *
 **/
export const GadmResolverV1 = withStyles(() => ({
  root: {
    // maxWidth: "75%",
    // padding: "1rem",
    margin: 'auto',
    marginTop: '7rem',
    display: 'flex',
    flexDirection: 'column',
    // flex: 1
  },
  table: {
    flex: 1
    // width: 700
  },
  gridHeader: {
    backgroundColor: '#f0f8ff'
  },
  row: {
    cursor: 'pointer'
  },
  alert: {
    backgroundColor: 'white',
    alignItems: 'center',
  }
}))(({ classes, gadmRowData, primaryCountryField }) => {

  const [isOpen, setOpen] = React.useState(false);

  const handleRowClick = () => {
    setOpen(true);
  };

  return (

      <div
        className={classes.root}
        style={{ minHeight: 500, width: 700 }}
      >

        <Typography variant="h5" gutterBottom>
          Review Administrative Area Detection
        </Typography>

        <MuiAlert
          classes={{standardInfo: classes.alert}}
          severity="info"
        >
          Dojo has automatically resolved GADM mappings for the primary date country field <span style={{backgroundColor: '#f1f1f1', padding: 2}}>{primaryCountryField}</span>.
          The following country Administrative areas have been identified with a lower confidence level. Review and adjust as needed.
        </MuiAlert>

        <br />

        <DataGrid
          autoPageSize
          className={classes.table}
          classes={{root: classes.table, columnHeader: classes.gridHeader, row: classes.row}}
          disableSelectionOnClick
          disablePagination
          disableColumnMenu
          disableColumnFilter
          onRowClick={handleRowClick}
          columns={columns}
          rows={gadmRowData}
        />

        <AdjustGadmDialog open={isOpen} onClose={() => setOpen(false)}/>

      </div>
  );
});


const gadmResolverColumns = [
  {
    id: 'raw_value',
    label: 'Raw Value',
    // flex: 1,
    minWidth: 25,
  },
  {
    id: 'gadm_resolved',
    label: 'GADM Resolved',
    // flex: 1,
    minWidth: 50,
  }
];


// <TextField
//   variant="outlined"
//   select
//   SelectProps={{
//     native: true,
//   }}
// >
//   {row['alternatives'].map((option) => (
//     <option
//       key={option}
//       value={option}
//     >
//       {option}
//     </option>
//   ))}
// </TextField>

//    <Select
//      classes={{root: classes.selectRoot, nativeInput: classes.nativeInput}}
//      variant="outlined"
//      displayEmpty
//      InputProps={{classes: {root: classes.selectInput}}}
//      native
//      defaultValue={[row['gadm_resolved']]}
//    >
//      {row['alternatives'].map((option) => (
//        <option
//          key={option}
//          value={option}
//        >
//          {option}
//        </option>
//      ))}
//    </Select>



/**
 *
 **/
const GadmResolverTable = withStyles(() => ({
  table: {
    // flex: 1
    maxHeight: '100%'
  },
  tableHeader: {
    // light blue
    // backgroundColor: '#f0f8ff'
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
}))(({classes, rows}) => {

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
                  <Typography variant="h5">
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
                  key={row.id}
                >
                  <TableCell className={classes.tableCell}>
                    {row['raw_value']}
                  </TableCell>

                  <TableCell className={classes.tableCell}>
                    <TextField
                      variant="outlined"
                      select
                      className={classes.selectRoot}
                      InputProps={{
                        classes: {
                          root: classes.outlined,
                          input: classes.innerInputOutlined
                        }
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      {row['alternatives'].map((option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      ))}
                    </TextField>
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
    border: '1px solid #d7d7d7',
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
}))(({ classes, gadmRowData, primaryCountryField }) => {

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
            The following GADM mappings for primary country <span style={{backgroundColor: '#f1f1f1', padding: 2}}>{primaryCountryField}</span> have been identified with lower confidence. Adjust as needed.
          </MuiAlert>
        </div>

        <div className={classes.tableFlexer}>
          <div className={classes.tableFlexerAutoHeight}>
            <Paper
              className={classes.tableContainer}
              elevation={0}
              >
              <GadmResolverTable rows={gadmRowData} />
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
              color="default">
              Cancel
            </Button>
            <Button
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
