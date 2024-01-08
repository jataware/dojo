/* eslint-disable sort-imports */
import React from 'react';
import { Link, useParams } from 'react-router-dom';

import capitalize from 'lodash/capitalize';
import toLower from 'lodash/toLower';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import QueuedJobIcon from '@mui/icons-material/Schedule';
import RunningJobIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { withStyles } from 'tss-react/mui';
import { useRun } from './SWRHooks';

import { ExternalLink, InternalTab } from './Links';
import LoadingOverlay from './LoadingOverlay';
import { parseDatetimeString, formatDatetime } from '../utils';
import usePageTitle from './uiComponents/usePageTitle';

// ------------------------ Parent Styles --------------------------------------

const styles = (theme) => ({
  root: {
    padding: `${theme.spacing(10)} ${theme.spacing(2)} ${theme.spacing(2)}`,
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  details: {
    backgroundColor: theme.palette.grey[50],
    borderRadius: '4px',
    width: '100%',
    padding: theme.spacing(3)
  },
  accentedValue: {
    background: theme.palette.grey[100],
    padding: '0.75rem',
    border: `2px solid ${theme.palette.grey[200]}`,
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  badgeList: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > li': {
      marginRight: '0.5rem'
    }
  },
  button: {
    border: '2px solid black',
    backgroundColor: 'white',
    color: 'black'
  },
  downloadButton: {
    paddingTop: theme.spacing(1),
  },

});

// -------------------------- Helper Components --------------------------------
const useDefaultIcon = null;

const statusAssets = {
  success: { icon: useDefaultIcon, severity: 'success' },
  failed: { icon: useDefaultIcon, severity: 'error' },
  queued: { icon: QueuedJobIcon, severity: 'warning' },
  running: { icon: RunningJobIcon, severity: 'info' }
};

/**
 * Renders Status for a Model Run
 */
export const Status = ({
  children, responsive, refresh, ...props
}) => {
  const status = toLower(children || 'queued');
  const { icon: Icon, severity } = statusAssets[status];
  const showRefreshButton = Boolean(refresh) && ['queued', 'running'].includes(status);
  const refreshActionStyles = { background: !refresh && 'none', padding: !refresh && 0 };

  return (
    <Alert
      action={showRefreshButton && (
        <Button color="inherit" size="small" onClick={refresh}>
          REFRESH
        </Button>
      )}
      icon={Icon && <Icon />}
      severity={severity}
      style={refreshActionStyles}
      {...props}
    >
      <Box sx={{ display: { xs: responsive ? 'none' : 'block', lg: 'block' } }}>
        {capitalize(status)}
      </Box>
    </Alert>
  );
};

const Label = ({ children: content, ...props }) => (
  <Typography
    variant="h6"
    color="textSecondary"
    aria-label={content}
    {...props}
  >
    {content}
  </Typography>
);

const Value = ({ href, title, ...props }) => {
  const component = href ? ExternalLink : 'p';
  return (
    <Typography
      variant="body1"
      href={href}
      component={component}
      style={{ display: 'block' }}
      aria-label={title}
      title={title}
      paragraph
      {...props}
    />
  );
};

const SectionGridItem = ({
  title, classes, children, empty, ...props
}) => (
  <Grid
    item
    xs={12}
    md={6}
    sx={{
      padding: '1.5rem',
      '& ul': {
        listStyle: 'none',
        marginBlockStart: '0.25em',
        marginBlockEnd: 0,
        paddingInlineStart: 0,
        overflow: 'auto'
      }
    }}
    role="region"
    aria-label={title}
    {...props}
  >

    <Typography
      variant="h5"
      gutterBottom
      aria-label={title}
    >
      {title}
    </Typography>

    {empty ? <Typography>No {title}</Typography> : children}

  </Grid>
);

// -------------------------- Main Container ----------------------------------

const RunSummary = ({ classes }) => {
  const { runid } = useParams();

  const {
    run,
    runLoading: isRunLoading,
    runError: fetchErrors,
    mutateRun
  } = useRun(runid);

  const refreshRun = () => {
    mutateRun();
  };

  usePageTitle({ title: `Run ${runid}` });

  if (fetchErrors) {
    return (
      <LoadingOverlay
        text={`There was an error loading data for Run ${runid}`}
        error
      />
    );
  }

  if (isRunLoading) {
    return <LoadingOverlay text="Loading Run Data" />;
  }

  const {
    parameters,
    pre_gen_output_paths: preGenOutputPaths,
    created_at: createdAt,
    data_paths: dataPaths
  } = run;

  const outputPaths = preGenOutputPaths || [];
  const creationDatetime = formatDatetime(new Date(createdAt));
  const executed = get(run, 'attributes.executed_at');
  const finishedDatetime = executed ? formatDatetime(parseDatetimeString(executed)) : '-';

  return (

    <Container
      className={classes.root}
      component="main"
      maxWidth="lg"
    >

      <Typography
        className={classes.header}
        variant="h4"
        align="center"
      >
        Model Run Summary
      </Typography>

      <Grid container className={classes.details}>

        {!isEmpty(run) ? (
          <>

            <SectionGridItem title="Attributes">
              <Grid container>

                <Grid item xs={12} sm={6}>
                  <Label>Run ID</Label>
                  <Value title="Run ID Value">{run.id}</Value>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Label>Status</Label>

                  <div style={{ marginBottom: '1rem' }}>
                    <Status refresh={refreshRun}>
                      {get(run, 'attributes.status')}
                    </Status>
                  </div>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Label>
                    Model ID
                  </Label>
                  <Value title="Model ID Value">
                    <InternalTab href={`/summary/${run.model_id}`}>
                      {run.model_id}
                    </InternalTab>
                  </Value>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Label>Model Name</Label>
                  <Value title="Model Name Value">{run.model_name}</Value>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Label>Created on</Label>
                  <Value title="Created On Value">{creationDatetime}</Value>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Label>Completed on</Label>
                  <Value title="Completed On Value">{finishedDatetime}</Value>
                </Grid>
              </Grid>

              <Button
                className={classes.button}
                component={Link}
                fullWidth
                variant="outlined"
                style={{ marginTop: '0.5rem' }}
                to={`/runlogs/${run.id}`}
                color="grey"
              >
                View Logs
              </Button>
              {/*
                 Model run download is currently broken, removing this until the issue is resolved
                 {get(run, 'attributes.status') === 'success' && (
                 <div style={{ marginTop: '16px' }}>
                 <CSVDownload
                 resource={run}
                 index="runs"
                 />
                 </div>
                 )}
               */}
            </SectionGridItem>

            <SectionGridItem
              title="Parameters"
              empty={isEmpty(parameters)}
            >
              <ul className={classes.badgeList}>
                {parameters.map(({ name, value }) => (
                  <li
                    key={name + value}
                    className={classes.accentedValue}
                  >
                    <Label>{name}</Label>

                    <Typography variant="h6">
                      {value}
                    </Typography>
                  </li>
                ))}
              </ul>
            </SectionGridItem>

            <SectionGridItem
              title="Data Paths"
              empty={isEmpty(dataPaths)}
              md={12}
            >
              <ul>
                {dataPaths.map((path) => (
                  <li key={path}>
                    <Value
                      href={path}
                      title="Data Path Value"
                    >
                      {path}
                    </Value>
                  </li>
                ))}
              </ul>
            </SectionGridItem>

            <SectionGridItem
              title="Output Paths"
              empty={isEmpty(outputPaths)}
              md={12}
            >
              <ul>
                {outputPaths.map(({ file, caption }) => (
                  <li key={file + caption}>
                    <Label style={{ textTransform: 'capitalize' }}>
                      {caption}
                    </Label>
                    <Value
                      href={file}
                      title="Output Path Value"
                    >
                      {file}
                    </Value>
                  </li>
                ))}
              </ul>
            </SectionGridItem>

          </>
        ) : (
          <Typography>Unexpected Error. No Run found.</Typography>
        )}
      </Grid>

    </Container>
  );
};

export default withStyles(RunSummary, styles);
