import React, { useEffect } from 'react';

import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArticleIcon from '@mui/icons-material/Article';
import ComputerIcon from '@mui/icons-material/Computer';
import GitHubIcon from '@mui/icons-material/GitHub';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import { makeStyles } from 'tss-react/mui';

import { ContrastButton } from './components/uiComponents/ContrastButton';

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
    [theme.breakpoints.up('lg')]: {
      marginBottom: theme.spacing(6),
    },
    [theme.breakpoints.down('xl')]: {
      marginBottom: theme.spacing(3),
    },
  },
  bottomContentWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.down('xl')]: {
      padding: `${theme.spacing(3)} ${theme.spacing(4)} ${theme.spacing(4)}`,
    },
  },
  bottomContentContainer: {
    // TODO: check this on a bigger screen - may not look good at the very bottom
    display: 'flex',
    alignItems: 'flex-end',
    flexGrow: 1,
    padding: theme.spacing(4),
  },
  linksWrapper: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'flex-start',
    marginBottom: theme.spacing(3),

  },
  links: {
    display: 'flex',
    gap: theme.spacing(4),
    flexWrap: 'wrap',
  },
  linkCta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    maxWidth: '220px',
    minWidth: '220px',
  },
  button: {
    color: 'black',
    backgroundColor: 'white',
    minWidth: '230px',
  },
  bigIcon: {
    fontSize: '3rem',
  },
}));

const LandingPage = () => {
  const { classes } = useStyles();

  useEffect(() => {
    document.title = 'Home - Dojo';
  }, []);

  return (
    <Box className={classes.allContentWrapper}>
      <div className={classes.topContentWrapper}>
        <Container maxWidth="xl">

          {/* Always line break before 'and datasets' because it scans better */}
          <Typography variant="h1" className={classes.topHeaderTitle}>
            Dojo helps researchers share their models <br />and datasets
          </Typography>
          <Typography variant="h6" className={classes.topHeaderSubtitle}>
            Create containerized, shareable models for reproducible research with easy-to-consume
            outputs. Register and transform datasets for use in downstream modeling workflows.
          </Typography>
          <div className={classes.linksWrapper}>
            <Typography variant="h4" align="center" className={classes.linkCta}>
              Get started <ArrowForwardIcon fontSize="large" />
            </Typography>
            <div className={classes.links}>
              <ContrastButton
                component={RouterLink}
                color="inherit"
                data-test="landingPageModelForm"
                to="/models"
                variant="contained"
                disableElevation
                size="large"
                endIcon={<ComputerIcon />}
                className={classes.button}
              >
                Models
              </ContrastButton>

              <ContrastButton
                component={RouterLink}
                variant="contained"
                color="inherit"
                to="/datasets"
                disableElevation
                size="large"
                endIcon={<AssessmentIcon />}
                className={classes.button}
              >
                Datasets
              </ContrastButton>
              <ContrastButton
                component={RouterLink}
                variant="contained"
                color="inherit"
                to="/documents"
                disableElevation
                size="large"
                endIcon={<ArticleIcon />}
                className={classes.button}
              >
                Documents
              </ContrastButton>
            </div>
          </div>
        </Container>
      </div>
      <Container maxWidth="xl" className={classes.bottomContentContainer}>
        <div className={classes.linksWrapper}>
          {/* specific top margin to center this on the existing model text */}
          <Typography
            variant="h5"
            align="center"
            className={classes.linkCta}
          >
            Or learn more <ArrowForwardIcon fontSize="large" />
          </Typography>
          <div className={classes.links}>
            <ContrastButton
              startIcon={<MenuBookIcon />}
              sx={{ textDecoration: 'underline' }}
              href="https://www.dojo-modeling.com"
              target="_blank"
              rel="noopener"
              size="large"
              className={classes.button}
            >
              Read the docs
            </ContrastButton>

            <ContrastButton
              startIcon={<GitHubIcon />}
              sx={{ textDecoration: 'underline' }}
              href="https://www.dojo-modeling.com"
              target="_blank"
              rel="noopener"
              size="large"
              className={classes.button}
            >
              Browse Dojo on GitHub
            </ContrastButton>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default LandingPage;
