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
import BrandSwap, { BrandName, useBranding } from './components/uiComponents/BrandSwap';

const useStyles = makeStyles()((theme) => ({
  allContentWrapper: {
    height: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
  },
  topContentWrapper: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.custom.landing.backgroundColor,
    backgroundImage: theme.custom.nav.image,
    color: theme.custom.landing.color,
    padding: `${theme.spacing(4)} 0`,
  },
  topHeaderTitle: {
    fontSize: '7rem',
    fontWeight: '450',
    maxWidth: '900px',
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
    // TODO: handle capitalizing this properly - hook that returns title?
    const title = process.env.COMPANY_BRANDING;
    document.title = `Home - ${title}`;
  }, []);

  return (
    <Box className={classes.allContentWrapper}>
      <div className={classes.topContentWrapper}>
        <Container maxWidth="lg">
          <BrandSwap
            dojoComponent={(
              <>
                <Typography variant="h1" className={classes.topHeaderTitle}>
                  Dojo
                </Typography>
                <Typography variant="h6" sx={{ marginBottom: 3 }}><i>noun</i> &nbsp;/dō′jō/</Typography>
              </>
            )}
            ifpriComponent={(
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '3rem',
                  gap: '1rem',
                  width: '800px'
                }}
              >
                <img src="/assets/ifpri-logo-green.png" width="290" />
                <Typography variant="h3" sx={{ fontSize: '5rem', fontWeight: '450' }}>
                  IFPRI Data Hub
                </Typography>
              </Box>
            )}
          />
          <Typography variant="h3" sx={{ marginBottom: 6 }}>
            a platform for model, data and<br /> knowledge analysis & management
          </Typography>
          <Typography variant="h6" className={classes.topHeaderSubtitle}>
            Create containerized, shareable models for reproducible research with easy-to-consume
            outputs. Register and transform datasets for <BrandName />&apos;s
            no-code data modeling tool and other downstream uses.
            Retrieve domain-specific knowledge using&nbsp;
            <BrandName />&apos;s state of the art AI Assistant.
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
                to="/models/intro"
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
                to="/datasets/intro"
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
                to="/documents/intro"
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
      <Container maxWidth="lg" className={classes.bottomContentContainer}>
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
              Browse <BrandSwap dojoComponent="Dojo" ifpriComponent="the Repo" /> on GitHub
            </ContrastButton>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default LandingPage;
