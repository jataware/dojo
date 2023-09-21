import React from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Button from '@mui/material/Button';

import { makeStyles } from 'tss-react/mui';

import NodeTitles from './nodeLabels';

const useStyles = makeStyles()((theme) => ({
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    margin: theme.spacing(2),
    '& > button': {
      fontSize: '10px',
      padding: '0.5rem 3.5rem',
      cursor: 'grab',
      maxWidth: '200px',
    }
  },
}));

export default () => {
  const { classes } = useStyles();
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={classes.sidebar}>
      <Button
        color="success"
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'load')}
        draggable
      >
        {NodeTitles.LOAD}
      </Button>

      <Button
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'threshold')}
        draggable
      >
        {NodeTitles.THRESHOLD}
      </Button>

      <Button
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'multiply')}
        draggable
      >
        {NodeTitles.MULTIPLY}
      </Button>

      <Button
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'country_split')}
        draggable
      >
        {NodeTitles.COUNTRY_SPLIT}
      </Button>

      <Button
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'sum')}
        draggable
      >
        {NodeTitles.SUM}
      </Button>

      <Button
        color="success"
        variant="outlined"
        startIcon={<DragIndicatorIcon />}
        disableRipple
        onDragStart={(event) => onDragStart(event, 'save')}
        draggable
      >
        {NodeTitles.SAVE}
      </Button>
    </div>
  );
};
