import React, { useEffect } from 'react';

import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

import { makeStyles } from 'tss-react/mui';

import InlineDocLink from './uiComponents/InlineDocLink';

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
    width: '120px',
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  action: {
    display: 'grid',
    gridTemplateColumns: '1fr 50px 2fr 50px 0.5fr',
    columnGap: theme.spacing(2),
    alignItems: 'center',
    width: '100%',
  },
  actions: {
    display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', width: '100%', gap: 4
  }
}));

const ActionHighlight = ({
  title, text, linkTitle, link, docsLink
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.action}>
      <Typography variant="h5">{title}</Typography>
      <HorizontalRuleIcon fontSize="large" />
      <Typography variant="subtitle1">
        {text}
        {docsLink && <InlineDocLink title={linkTitle} link={docsLink} color="secondary" />}
      </Typography>
      <HorizontalRuleIcon fontSize="large" />
      <Button
        component={RouterLink}
        to={link}
        variant="contained"
        disableElevation
        className={classes.button}
        endIcon={<ArrowForwardIcon fontSize="large" />}
      >
        {linkTitle}
      </Button>
    </div>
  );
};

export const ColorText = ({ children }) => (
  <Typography variant="h4" component="span" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{children}</Typography>
);

const GenericIntroPage = ({ title, subtitle, actions }) => {
  const { classes } = useStyles();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Box className={classes.allContentWrapper}>
      <div className={classes.topContentWrapper}>
        <Container maxWidth="lg">
          <Breadcrumbs sx={{ color: 'white' }}>
            <Link color="inherit" component={RouterLink} underline="none" to="/">Home</Link>
            <Typography><b>{title}</b></Typography>
          </Breadcrumbs>
          <Typography variant="h1" className={classes.topHeaderTitle}>
            {title}
          </Typography>
          <Typography variant="h6" className={classes.topHeaderSubtitle}>
            {subtitle}
          </Typography>

        </Container>
      </div>
      <Container maxWidth="lg" className={classes.bottomContentContainer}>
        <div className={classes.actions}>
          {actions.map((action) => (
            <ActionHighlight
              key={action.link}
              title={action.title}
              text={action.text}
              linkTitle={action.linkTitle}
              link={action.link}
              linkIcon={action.linkIcon}
              docsLink={action.docsLink}
            />
          ))}
        </div>
      </Container>
    </Box>
  );
};

export default GenericIntroPage;
