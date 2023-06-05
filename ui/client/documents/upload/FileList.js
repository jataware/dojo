import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import { formatBytes } from '../utils';

/**
 *
 **/
export const FileTile = withStyles(() => ({
  root: {
    cursor: 'pointer'
  },
  dataGrouping: {
    display: 'flex',
    alignItems: 'center'
  },
  selectedContainer: {
  },
  fileInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  loadingContainer: {
  },
  filenameText: {
    wordBreak: 'break-all'
  }
}))(({
  classes, file, value, onClick, selected, onDelete
}) => {
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <ListItem
      selected={selected}
      className={classes.root}
      button
      onClick={onClick}
    >

      <ListItemIcon className={classes.selectedContainer}>
        <Radio value={value} disableRipple />
      </ListItemIcon>

      <ListItemText
        classes={{ primary: classes.filenameText }}
        primary={file.name}
        secondary={`Size: ${formatBytes(file.size)}`}
      />

      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={handleDeleteClick}>
          <ClearIcon />
        </IconButton>
      </ListItemSecondaryAction>

    </ListItem>
  );
});

/**
 *
 **/
export const SelectedFileList = withStyles(() => ({
  root: {
    border: '1px solid #eaeaea',
    borderRadius: 0,
    height: '100%',
    position: 'relative'
  },
  list: {
    overflowY: 'auto',
    height: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white'
  }
}))(({
  classes, files, onItemClick, onDelete, selectedIndex
}) => (
  <Paper
    className={classes.root}
  >
    <RadioGroup
      value={`${selectedIndex}`}
    >

      <List
        subheader={(
          <ListSubheader component="div">
            Files
          </ListSubheader>
        )}
        className={classes.list}
      >
        {files.map((file, index) => file && (
          <FileTile
            onDelete={() => onDelete(index)}
            selected={index === selectedIndex}
            onClick={() => onItemClick(index)}
            value={`${index}`}
            file={file}
            key={file.path + file.size}
          />
        ))}
      </List>
    </RadioGroup>
  </Paper>
));
