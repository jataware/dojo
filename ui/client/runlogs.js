import React, { useEffect, useState } from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles, useTheme } from '@material-ui/core/styles';

import { Link, useHistory, useLocation, useParams } from 'react-router-dom';

import BasicAlert from './components/BasicAlert';
import DeletionDialog from './components/DeletionDialog';
import DirectiveBox from './components/DirectiveBox';
import FileCardList from './components/FileCardList';
import FullScreenDialog from './components/FullScreenDialog';
import LoadingOverlay from './components/LoadingOverlay';

import {
    useRunLogs
} from './components/SWRHooks';
import { mergeClasses } from '@material-ui/styles';
import { red } from '@material-ui/core/colors';


const useStyles = makeStyles((theme) => ({
  task: {
    border: "solid 1px black rounded",
  },

  logs: {
    backgroundColor: theme.palette.grey[200],
    whiteSpace: 'pre-wrap',
    padding: '1em',
  },

  collapsed: {
    maxHeight: '3em',
    cursor: 'pointer',
  },

  notfound: {
    color: 'red',
    textDecoration: 'underline',
  }
}));

const LogStep = ({taskName, content, isOpen}) => {
  const [expanded, setExpanded] = useState(isOpen);
  const classes = useStyles();

  return (
    <div className={classes.task}>
      <h1>{taskName}</h1>
      {
        expanded ? 
        <div className={classes.logs} onClick={() => (setExpanded(!expanded))}>
          {content}
        </div>
        :
        <div className={classes.collapsed} onClick={() => (setExpanded(!expanded))}>
          Click to expand
        </div>
      }
    </div>
  );
}


const RunLogs = () => {
  const { runid } = useParams();
  const {
    runLogs, runLogsLoading, runLogsError, mutateRunLogs
  } = useRunLogs(runid);
  const classes = useStyles();


  console.log(runid, runLogs, runLogsError);

  return (
    <Container>
      <h1>Logs for run {runid}</h1>
      {!runLogsLoading && !runLogsError && runLogs?.tasks.map((task) => (
        <LogStep 
          key={task.task}
          taskName={task.task} 
          content={task.logs} 
          isOpen={task.state !== 'success'} 
        />
      ))}

      {runLogsError?.status == 404 && (
        <div>
          <h1 className={classes.notfound}>No logs found associated with this run.</h1>
          <div>Are you sure this ran?</div>
        </div>
      )
      }
    </Container>
  );
};

export default RunLogs;
