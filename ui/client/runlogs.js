import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import { useParams } from 'react-router-dom';

import {
  useRunLogs
} from './components/SWRHooks';
import usePageTitle from './components/uiComponents/usePageTitle';

const useStyles = makeStyles()(() => ({
  title: {
    marginTop: '1em',
  },

  button: {
    marginLeft: '2em',
  },

  task: {
    border: 'solid 1px black rounded',
  },

  logs: {
    marginTop: '1em',
    borderRadius: '1em',
    whiteSpace: 'pre-wrap',
    padding: '2em',
  },

  collapsed: {
    maxHeight: '3em',
    cursor: 'pointer',
  },

  notfound: {
    color: 'red',
    textDecoration: 'underline',
  },

  success: {
    backgroundColor: 'rgba(129, 199, 132, 0.25)',
  },

  failed: {
    backgroundColor: 'rgba(229, 115, 115, 0.25)',
  },

  running: {
    backgroundColor: 'rgba(100, 181, 246, 0.25)',
  },
}));

const LogStep = ({ taskName, content, state }) => {
  const [expanded, setExpanded] = useState(state !== 'success');
  const { classes } = useStyles();

  return (
    <div className={classes.task}>
      <Typography variant="h3" className={classes.title}>{taskName}
        <Button startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} variant="outlined" className={classes.button} size="small" onClick={() => (setExpanded(!expanded))}>
          { expanded
            ? 'Collapse'
            : 'Expand'}
        </Button>
      </Typography>
      { expanded
        ? (
          <div className={`${classes.logs} ${classes[state]}`}>
            {content}
          </div>
        )
        : ''}
    </div>
  );
};

const RunLogs = () => {
  const { runid } = useParams();
  const {
    runLogs, runLogsLoading, runLogsError
  } = useRunLogs(runid);
  const { classes } = useStyles();

  usePageTitle({ title: 'Run Logs' });

  return (
    <Container>
      <Typography variant="h2">Logs for run {runid}</Typography>
      {!runLogsLoading && !runLogsError && runLogs?.tasks.map((task) => (
        <LogStep
          key={task.task}
          taskName={task.name}
          content={task.logs}
          state={task.state}
        />
      ))}

      {runLogsError?.status === 404 && (
        <div>
          <h1 className={classes.notfound}>No logs found associated with this run.</h1>
          <div>Are you sure this ran?</div>
        </div>
      )}
    </Container>
  );
};

export default RunLogs;
