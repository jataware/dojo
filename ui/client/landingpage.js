import React from 'react';

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
import { BrandSwap, BrandName } from './components/uiComponents/Branding';
import usePageTitle from './components/uiComponents/usePageTitle';
import { ExternalLink } from './components/Links';

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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
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
  cgiarMainImage: {
    margin: `0 auto ${theme.spacing(4)}`,
    display: 'block',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[300]}`
  },
}));

const LandingPage = () => {
  const { classes } = useStyles();

  usePageTitle({ title: 'Dojo Home' });

  return (
    <Box className={classes.allContentWrapper}>
      <div className={classes.topContentWrapper}>
        <Container maxWidth="lg">
          <BrandSwap
            dojo={(
              <>
                <Typography variant="h1" className={classes.topHeaderTitle}>
                  Dojo
                </Typography>
                <Typography variant="h6" sx={{ marginBottom: 3 }}><i>noun</i> &nbsp;/dō′jō/</Typography>
                <Typography variant="h3" sx={{ marginBottom: 6 }}>
                  a platform for model, data and<br /> knowledge analysis & management
                </Typography>
                <Typography variant="h6" sx={{ maxWidth: '70%' }} className={classes.topHeaderSubtitle}>
                  Create containerized, shareable models for reproducible research with
                  easy-to-consume outputs. Register and transform datasets
                  for <BrandName />&apos;s no-code data modeling tool and other downstream uses.
                  Retrieve domain-specific knowledge using&nbsp;
                  <BrandName />&apos;s state of the art AI Assistant.
                </Typography>
              </>
            )}
            cgiar={(
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '3rem',
                    gap: '1rem',
                  }}
                >
                  <ExternalLink href="https://on.cgiar.org/digital">
                    <img src="/assets/CGIAR-digital-innovation.png" width="320" />
                  </ExternalLink>
                  <Typography variant="h2" sx={{ fontSize: '4rem' }}>
                    DIGITAL <b>DOJO</b>
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ marginBottom: 6 }}>
                  A suite of datasets and modeling tools that facilitate analysis of food, land,
                  and water systems to inform policy and investment decisions
                </Typography>
                <img src="/assets/CGIAR-digital-twin.png" width="720" className={classes.cgiarMainImage} />
                <Typography variant="h6" className={classes.topHeaderSubtitle}>
                  CGIAR’s Digital Dojo enables users to test what-if scenarios and facilitates
                  informed policy and investment decisions across food, land, and water systems.
                  <br /><br />
                  Register and transform datasets for CGIAR’s no-code data analysis tools.
                  Share containerized models for reproducible data analytics research with
                  easy-to-consume analysis outputs.
                  Retrieve domain-specific knowledge using the state-of-the-art AI Assistant.
                </Typography>
              </>
            )}
          />
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
              Browse <BrandSwap dojo="Dojo" cgiar="the Repo" /> on GitHub
            </ContrastButton>
          </div>
        </div>
        <BrandSwap
          cgiar={(
            <Typography variant="body2">
              The CGIAR Digital Dojo is powered by DOJO, an open-source data and model-sharing
              platform by <ExternalLink href="https://jataware.com/">Jataware</ExternalLink> for
              the <ExternalLink href="https://worldmodelers.com/">World Modelers</ExternalLink> program.
            </Typography>
          )}
        />
      </Container>
    </Box>
  );
};

export default LandingPage;
