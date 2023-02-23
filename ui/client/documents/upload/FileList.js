import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { formatBytes } from '../utils';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

/**
 *
 **/
export const FileTile = withStyles((theme) => ({
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
  }
}))(({ classes, file, value, uploadStatus, onClick, selected, onDelete }) => {

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
        primary={file.name}
        secondary={`Size: ${formatBytes(file.size)}`}
      />

      {/* TODO Add delete icon when we need it, implement handler. */}
      {/* <ListItemSecondaryAction> */}
      {/*   <IconButton edge="end" aria-label="delete" onClick={onDelete}> */}
      {/*     <ClearIcon /> */}
      {/*   </IconButton> */}
      {/* </ListItemSecondaryAction> */}

    </ListItem>
  );
});

/**
 *
 **/
export const SelectedFileList = withStyles((theme) => ({
  root: {
    border: '1px solid #eaeaea',
    borderRadius: 0,
    height: '100%'
  },
  list: {
    overflowY: 'auto',
    height: '100%'
  }
}))(({ classes, files, onItemClick, onDelete, selectedIndex }) => {

  return (
    <Paper
      className={classes.root}
    >
      <RadioGroup
        value={selectedIndex+""}
      >

        <List
          subheader={
            <ListSubheader component="div">
              Files
            </ListSubheader>
          }
          className={classes.list}
        >
          {files.map((file, index) => file && (
            <FileTile
              onDelete={() => onDelete(index)}
              selected={index === selectedIndex}
              onClick={() => onItemClick(index)}
              value={index+""}
              file={file}
              key={file.path+file.size}
            />
          ))}
        </List>
      </RadioGroup>
    </Paper>
  );
});

