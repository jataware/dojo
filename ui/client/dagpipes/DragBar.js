import React from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Button from '@mui/material/Button';
import NodeTitles from './nodeLabels';

import './dragBar.scss';


export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar">

      <section>

        <Button
          color="success"
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'load');}}
          draggable
        >
          {NodeTitles.LOAD}
        </Button>

        <Button
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'threshold');}}
          draggable
        >
          {NodeTitles.THRESHOLD}
        </Button>

        <Button
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'multiply');}}
          draggable
        >
          {NodeTitles.MULTIPLY}
        </Button>

        <Button
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'country_split');}}
          draggable
        >
          {NodeTitles.COUNTRY_SPLIT}
        </Button>

        <Button
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'sum');}}
          draggable
        >
          {NodeTitles.SUM}
        </Button>

        <Button
          color="success"
          variant="outlined"
          startIcon={<DragIndicatorIcon />}
          className="dndnode input"
          disableRipple
          onDragStart={(event) => {return onDragStart(event, 'save');}}
          draggable
        >
          {NodeTitles.SAVE}
        </Button>

      </section>

    </div>
  );
};
