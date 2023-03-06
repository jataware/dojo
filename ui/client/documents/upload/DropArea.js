import React from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Typography from '@material-ui/core/Typography';

/**
 *
 **/
export const FileDropSelector = withStyles((theme => ({
  root: {
    margin: '1rem 0 1rem 0',
    padding: '2rem',
    borderRadius: '1rem',
    width: '100%',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    border: `3px dashed ${theme.palette.grey[200]}`,
  },
  dropActive: {
    borderColor: theme.palette.primary.main,
  },
  dropIcon: {
    width: '7rem',
    height: '7rem',
    padding: '0.5rem'
  }
})))(({classes, onFileSelect, onDropFilesRejected}) => {
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDropAccepted: onFileSelect,
    multiple: true,
    onDropRejected: onDropFilesRejected,
    accept: {
      'application/pdf': ['.pdf'],
    }
  });

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.dropActive]: isDragActive
      })}
      {...getRootProps()}
    >
      <IconButton size="medium" color={isDragActive ? "primary" : "default"}>
        <InboxIcon className={classes.dropIcon}  />
      </IconButton>

      <input {...getInputProps()} /> {/*is hidden*/}

      <Typography variant="h6" color="textSecondary">
        {
          isDragActive ?
            'Drop the files here' :
            'Drag PDFs here. Click to select files.'
        }
      </Typography>
    </div>
  );
});
