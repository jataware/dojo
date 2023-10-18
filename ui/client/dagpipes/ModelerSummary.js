import React, { useEffect, useState } from 'react';

import axios from 'axios';

import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// import { DataGrid } from '@mui/x-data-grid';

import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// import ExpandableDataGridCell from '../components/ExpandableDataGridCell';

// const expandableCell = ({ value, colDef }) => (
//   <ExpandableDataGridCell
//     value={value}
//     width={colDef.computedWidth}
//   />
// );

// const columns = [
//   {
//     field: 'name',
//     headerName: 'Name',
//     renderCell: expandableCell,
//     minWidth: 200,
//     flex: 1,
//     valueGetter: (params) => (
//       params.getValue(params.id, 'deprecated')
//         ? `DEPRECATED - ${params.row.name}` : params.row.name
//     )
//   },
//   {
//     field: 'id',
//     headerName: 'ID',
//     minWidth: 250,
//     flex: 1,
//   },
//   {
//     field: 'maintainer.name',
//     headerName: 'Maintainer',
//     minWidth: 140,
//     flex: 1,
//     valueGetter: (params) => params.row?.maintainer.name,
//   },
//   {
//     field: 'description',
//     headerName: 'Description',
//     renderCell: expandableCell,
//     minWidth: 200,
//     flex: 1,
//   },
//   {
//     field: 'link',
//     headerName: ' ',
//     sortable: false,
//     disableColumnMenu: true,
//     renderCell: ({ row }) => (
//       <Button
//         href={`/dataset_summary?dataset=${row.id}`}
//         variant="outlined"
//         color="grey"
//       >
//         View Dataset
//       </Button>
//     ),
//     minWidth: 210,
//   },
// ];

const mockDatasets = [
  '83de4099-ed1a-4a35-a204-4cb58bede279',
  '8987a98e-4128-4602-9f72-e3efa1b53668',
  '27d2e4ec-ba65-4fab-8bae-3837fb94ff77',
  '426040ca-b355-4994-8fa0-b83f649a2f9d',
  'd00db6c4-6c31-415f-8d83-20f9d5b8e233',
];

const ModelerSummary = () => {
  // const { completedDatasetIds } = useSelector((state) => state.dag);
  // const [datasets, setDatasets] = useState([]);
  const completedDatasetIds = mockDatasets;
  // TODO Question: do we want to just show the ID and a link to the summary page?
  // then no fetching required, and maybe we don't need any of the other stuff
  // useEffect(() => {
  //   console.log('these are the datasetIds:', completedDatasetIds);
  //   completedDatasetIds.forEach((datasetId) => {
  //     axios.get(`/api/dojo/indicators/${datasetId}`)
  //       .then((resp) => {
  //         console.log('this is the resp', resp);
  //         setDatasets((prevDatasets) => [resp.data, ...prevDatasets]);
  //       })
  //       .catch((error) => {
  //         console.log('there was an error', error);
  //       });
  //   });
  // }, [completedDatasetIds]);

  return (
    <Container
      sx={{ padding: [8, 2, 2], height: '70%' }}
      component="main"
      maxWidth="md"
    >
      <Typography variant="h4" align="center" sx={{ marginY: 3 }}>
        Datasets Generated From Graph
      </Typography>
      {!completedDatasetIds.length ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            height: '100%',
            gap: 2,
            color: 'grey.700'
          }}
        >
          <CircularProgress size={38} color="inherit" />
          <Typography variant="h5">Loading...</Typography>
        </Box>
      ) : (
        <>
          {/*<DataGrid
            autoHeight
            columns={columns}
            rows={datasets}
            getRowClassName={
              (params) => params.getValue(params.id, 'deprecated') && 'deprecatedDataset'
            }
          />*/}
          <TableContainer component={Paper}>
            <Table
              aria-label="summary-table"
              sx={{
                '& tr > th, & tr > td': { padding: 2 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Dataset ID</TableCell>
                  <TableCell align="right">Link to view</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedDatasetIds.map((datasetId) => (
                  <TableRow
                    key={datasetId}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {datasetId}
                    </TableCell>
                    <TableCell align="right">
                      <Link
                        href={`/dataset_summary?dataset=${datasetId}`}
                        rel="noopener"
                        target="_blank"
                      >
                        View Dataset
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default ModelerSummary;
