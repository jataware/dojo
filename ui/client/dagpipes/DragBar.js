import React from 'react';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { makeStyles } from 'tss-react/mui';

import { NodeTitles } from './constants';

const useStyles = makeStyles()((theme) => ({
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    margin: theme.spacing(2),
    '& > button': {
      justifyContent: 'flex-start',
      gap: 0,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      cursor: 'default',
      maxWidth: '200px',
    }
  },
}));

const DragButton = ({
  label, name, onDragStart, green
}) => (
  <Button
    color={green ? 'success' : 'primary'}
    variant="outlined"
    startIcon={<DragIndicatorIcon sx={{ cursor: 'grab' }} />}
    disableRipple
    onDragStart={(event) => onDragStart(event, name)}
    draggable
    sx={{
      '& .MuiButton-startIcon': {
        marginRight: 0,
      },
    }}
  >
    <Typography variant="caption" sx={{ cursor: 'grab' }}>
      &nbsp;{label}
    </Typography>
  </Button>
);

export default () => {
  const { classes } = useStyles();
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={classes.sidebar}>
      <DragButton label={NodeTitles.LOAD} name="load" onDragStart={onDragStart} green />
      <DragButton label={NodeTitles.THRESHOLD} name="threshold" onDragStart={onDragStart} />
      <DragButton label={NodeTitles.MULTIPLY} name="multiply" onDragStart={onDragStart} />
      <DragButton
        label={NodeTitles.FILTER_BY_COUNTRY}
        name="filter_by_country"
        onDragStart={onDragStart}
      />
      <DragButton label={NodeTitles.REDUCE_BY} name="sum" onDragStart={onDragStart} />
      <DragButton label={NodeTitles.SAVE} name="save" onDragStart={onDragStart} green />
    </div>
  );
};
