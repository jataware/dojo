import React from 'react';

import { useSelector } from 'react-redux';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const ModelerSummary = () => {
  const { completedDatasetIds } = useSelector((state) => state.dag);

  return (
    <Container
      sx={{ padding: [8, 2, 2], height: '70%' }}
      component="main"
      maxWidth="md"
    >
      <Typography variant="h4" align="center" sx={{ marginY: 3 }}>
        Result Datasets
      </Typography>
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
    </Container>
  );
};

export default ModelerSummary;
