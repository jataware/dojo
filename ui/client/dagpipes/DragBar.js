import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setNodesAndEdges, setSavedDatasets, setGeoResolutionColumn, setTimeResolutionColumn } from './dagSlice';
import { setModelerStep } from './dagSlice';

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
    gap: theme.spacing(1.5),
    margin: theme.spacing(2),
    '& > button': {
      justifyContent: 'flex-start',
      gap: 0,
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
      cursor: 'default',
    },
    '& > button:first-of-type': {
      justifyContent: 'center',
      marginBottom: theme.spacing(2),
    },
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

const ClearDataModelButton = ({ onClick }) => (
  <Tooltip title="Clear the current data model">
    <Button
      color="error"
      variant="contained"
      fullWidth
      onClick={onClick}
      sx={{ 
        marginTop: 4,  // Add space above the button
        marginBottom: 2,  // Keep some space below if needed
        padding: 1.5,  // Increase padding to make the button more prominent
      }}
    >
      Clear Data Model
    </Button>
  </Tooltip>
);

export default () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClearDataModel = useCallback(() => {
    if (window.confirm('Are you sure you want to clear this data model? This will delete your current model and take you back to the dataset selection step.')) {
      // Clear localStorage
      localStorage.removeItem('dagpipes-flow-session');

      // Reset Redux state
      dispatch(setNodesAndEdges({ nodes: [], edges: [] }));
      dispatch(setSavedDatasets({}));
      dispatch(setGeoResolutionColumn(null));
      dispatch(setTimeResolutionColumn(null));

      // Set the modeler step to 0 (DagDatasetSelector)
      dispatch(setModelerStep(0));

      console.log('Data model cleared. Returning to dataset selection step.');
    }
  }, [dispatch]);

  return (
    <div className={classes.sidebar}>
      <ClearDataModelButton onClick={handleClearDataModel} />
      <DragButton label={NodeTitles.LOAD} name="load" onDragStart={onDragStart} green />
      <DragButton label={NodeTitles.THRESHOLD} name="threshold" onDragStart={onDragStart} />
      <DragButton label={NodeTitles.MULTIPLY} name="multiply" onDragStart={onDragStart} />
      <DragButton
        label={NodeTitles.FILTER_BY_COUNTRY}
        name="filter_by_country"
        onDragStart={onDragStart}
      />
      <DragButton label={NodeTitles.REDUCE_BY} name="sum" onDragStart={onDragStart} />
      <DragButton
        label={NodeTitles.SCALAR_OPERATION}
        name="scalar_operation"
        onDragStart={onDragStart}
        smallText
      />
      <DragButton label={NodeTitles.SELECT_SLICE} name="select_slice" onDragStart={onDragStart} />
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
