import React, { useEffect } from 'react';

import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  allContentWrapper: {
    height: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
  },
  topContentWrapper: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#06B8EF',
    backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
    color: 'white',
    padding: `${theme.spacing(4)} 0`,
  },
  topHeaderTitle: {
    fontSize: '5rem',
    fontWeight: '450',
    maxWidth: '900px',
    [theme.breakpoints.up('lg')]: {
      marginBottom: theme.spacing(6),
    },
    [theme.breakpoints.down('xl')]: {
      marginBottom: theme.spacing(3),
    },
  },
  topHeaderSubtitle: {
    maxWidth: '70%',
  },
  bottomContentContainer: {
    display: 'flex',
    flexGrow: 1,
    padding: theme.spacing(4),
  },
  button: {
    height: '60px',
    width: '300px',
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#c71585',
    color: 'white',
    '&:hover': {
      backgroundColor: '#a91271',
    },
  },
  action: {
    display: 'grid',
    gridTemplateColumns: '0.75fr 50px 2fr 50px 1fr',
    columnGap: theme.spacing(2),
    alignItems: 'center',
    width: '100%',
  },
  actions: {
    display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', width: '100%', gap: 4
  }
}));

const ActionHighlight = ({
  title, text, linkTitle, link, linkIcon
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.action}>
      <Typography variant="h5">{title}</Typography>
      <ArrowForwardIcon fontSize="large" />
      <Typography variant="subtitle1">
        {text}
      </Typography>
      <ArrowForwardIcon fontSize="large" />
      <Button
        component={RouterLink}
        to={link}
        variant="contained"
        disableElevation
        endIcon={linkIcon}
        className={classes.button}
      >
        {linkTitle}
      </Button>
    </div>
  );
};

const ColorText = ({ children }) => (
  <b style={{ color: '#c71585' }}>{children}</b>
);

const DatasetsLandingPage = () => {
  const { classes } = useStyles();

  useEffect(() => {
    document.title = 'Datasets';
  }, []);

  return (
    <Box className={classes.allContentWrapper}>
      <div className={classes.topContentWrapper}>
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ color: 'white' }}>
            <Link color="inherit" component={RouterLink} underline="none" to="/">Home</Link>
            <Typography><b>Datasets Intro</b></Typography>
          </Breadcrumbs>
          <Typography variant="h1" className={classes.topHeaderTitle}>
            Datasets
          </Typography>
          <Typography variant="h6" className={classes.topHeaderSubtitle}>
            Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
            The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
          </Typography>

        </Container>
      </div>
      <Container maxWidth="xl" className={classes.bottomContentContainer}>
        <div className={classes.actions}>
          <ActionHighlight
            title={<><ColorText>register</ColorText> a new dataset</>}
            text="
              Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
              The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
            "
            linkTitle="Register"
            link="/datasets/register"
            linkIcon={<KeyboardIcon />}
          />
          <ActionHighlight
            title={<>use the <ColorText>data modeling</ColorText> tool</>}
            text="
              Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
              The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
            "
            linkTitle="Data Modeling"
            link="/data-modeling"
            linkIcon={<AssessmentIcon />}
          />
          <ActionHighlight
            title={<><ColorText>view</ColorText> existing datasets</>}
            text="
              Dojo leverages AI to infer data types, including date format and geographic information to streamline the data annotation process.
              The outcome is a well-defined dataset in a ready to use, geocoded and normalized form.
            "
            linkTitle="View Datasets"
            link="/datasets"
            linkIcon={<FormatListBulletedIcon />}
          />
        </div>
      </Container>
    </Box>
  );
};

export default DatasetsLandingPage;
