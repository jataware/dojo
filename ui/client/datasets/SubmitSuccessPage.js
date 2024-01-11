import React from 'react';

import { makeStyles } from 'tss-react/mui';

import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { BrandName } from '../components/uiComponents/Branding';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: `${theme.spacing(6)} ${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(4)}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  wrapper: {
    flex: 1,
    flexDirection: 'column',

    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(3rem, auto))',
    gridTemplateRows: 'repeat(8, minmax(2rem, auto))'
  },
  contents: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),

    gridColumn: '2 / 6',
    gridRow: '2 / 5',
  },
  icon: {
    fontSize: '8rem', color: '#8cd9a1'
  }
}));

/**
 *
 * */
export default ({ datasetInfo }) => {
  const { classes } = useStyles();
  return (
    <Container
      className={classes.root}
      component="main"
      maxWidth="xl"
    >

      <div className={classes.wrapper}>
        <Paper
          elevation={3}
          className={classes.contents}
        >

          <CloudDoneIcon className={classes.icon} />

          <br />

          <Typography
            variant="h5"
            paragraph
          >
            Your dataset has been successfully registered
          </Typography>

          <div>
            <Button
              color="primary"
              component="a"
              href="/datasets/register"
              size="large"
            >
              Register Another Dataset
            </Button>
              &nbsp;
            <Button
              size="large"
              to={`/dataset_summary?dataset=${datasetInfo?.id}`}
              component={Link}
            >

              View in <BrandName />
            </Button>
          </div>

        </Paper>
      </div>

    </Container>
  );
};
