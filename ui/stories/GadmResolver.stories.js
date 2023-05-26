import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import random from 'lodash/random';
import rcountry from 'random-country';

import { GridOverlay, DataGrid } from '@material-ui/data-grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import TextField from '@material-ui/core/TextField';

import MuiAlert from '@material-ui/lab/Alert';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../client/theme';
import { Navigation } from '../client/datasets/';

const columns = [
  {
    field: 'raw_value',
    headerName: 'Raw Value',
    flex: 1
    // minWidth: 200,
  },
  {
    field: 'gadm_resolved',
    headerName: 'GADM Resolved',
    flex: 1
  },
  {
    field: 'adjusted',
    headerName: 'User Adjusted',
    // renderCell: expandableCell,
    flex: 1
  }
];

const mockRowCount = 5;
const mockData = [];

for (let i = 0; i < mockRowCount; i++) {
  let country = rcountry({ full: true })
  mockData.push({id: random(1, 10000), raw_value: country.replace('e','').replace('a','i'), gadm_resolved: country, adjusted: '-'})
}


console.log('mockData', mockData);

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
const GadmResolver = withStyles(() => ({
  root: {
    // maxWidth: "75%",
    // padding: "1rem",
    margin: 'auto',
    marginTop: '7rem',
    // display: 'flex',
    // flexDirection: 'column',
    // flex: 1
  },
  table: {
    // flex: 1
    width: 600
  },
  gridHeader: {
    backgroundColor: '#f0f8ff'
  },
  row: {
    cursor: 'pointer'
  },
  alert: {
    backgroundColor: 'white'
  }
}))(({ classes }) => {

  const [isOpen, setOpen] = React.useState(false);

  const handleRowClick = () => {
    setOpen(true);
  };

  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div
        className={classes.root}
        style={{ height: 400, width: 600 }}
      >

        <Typography variant="h5" gutterBottom>
          Review Administrative Area Detection
        </Typography>

        <br />

        <MuiAlert
          classes={{standardInfo: classes.alert}}
          severity="info"
        >
          Dojo has automatically resolved GADM mappings for the primary date country field <span style={{backgroundColor: '#f1f1f1', padding: 2}}>eventCountry</span>.
          The following country Administrative areas have been identified with a lower confidence level. Review and adjust as needed.
        </MuiAlert>

        <br />

        <DataGrid
          className={classes.table}
          classes={{root: classes.table, columnHeader: classes.gridHeader, row: classes.row}}
          disableSelectionOnClick
          disablePagination
          disableColumnMenu
          disableColumnFilter
          onRowClick={handleRowClick}
          columns={columns}
          rows={mockData}
          pageSize={40}
        />

        <AdjustGadmDialog open={isOpen} onClose={() => setOpen(false)}/>

        <Navigation style={{marginTop: '3rem'}}/>
      </div>


    </ThemeProvider>
  );
});




export default {
  title: 'Dataset Registration/GadmResolver',
  component: GadmResolver,

  // decorators: [
  //   (Story) => (
  //     <Formik>
  //       {(formik) => (
  //         <Form>
  //           <Story />
  //         </Form>
  //       )}
  //     </Formik>
  //   )
  // ]
};

const Template = (args) => (
  <GadmResolver {...args} />
);

export const Basic = {
  args: {
  }
};
