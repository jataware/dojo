import React from 'react';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

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
  label, name, onDragStart, green, smallText
}) => (
  <Tooltip
    title={`Drag and drop the ${label} Node to learn more`}
    // long delay so it only shows up when a user is pausing
    enterDelay={1200}
    enterNextDelay={1200}
  >
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
      <Typography variant="caption" sx={{ cursor: 'grab', fontSize: smallText ? '0.6rem' : 'caption.fontSize' }}>
        &nbsp;{label}
      </Typography>
    </Button>
  </Tooltip>
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
      <DragButton label={NodeTitles.SCALAR_OPERATION} name="scalar_operation" onDragStart={onDragStart} />
      <DragButton
        label={NodeTitles.MASK_TO_DISTANCE_FIELD}
        name="mask_to_distance_field"
        onDragStart={onDragStart}
        smallText
      />
      <DragButton label={NodeTitles.SAVE} name="save" onDragStart={onDragStart} green />
    </div>
  );
};
