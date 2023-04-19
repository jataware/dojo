import React from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Typography from '@material-ui/core/Typography';

const extensionMap = {
  'pdf':{
    'application/pdf': ['.pdf'],
  },
  'csv':{
    'text/csv': ['.csv'],
  },
  'xls': {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xls']
  },
  'xlsx': {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
};

export function formatExtensionForDropZone(extensionsArray) {
  return extensionsArray.reduce((acc, extension) => {
    // Optional preceding dot . for extension removed
    let buff = extension.replace(/^\./g, '');

    return {...acc, ...extensionMap[buff]};
  }, {});
}

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
  },
  mini: {
    flex: '0',
    border: 'none',
    padding: 1,
    margin: 1,
    flexDirection: 'row'
  }
})))(({classes, onFileSelect, onDropFilesRejected, acceptExtensions, mini, CTA, multiple=true}) => {

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDropAccepted: onFileSelect,
    multiple,
    onDropRejected: onDropFilesRejected,
    accept: formatExtensionForDropZone(acceptExtensions)
  });

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.dropActive]: isDragActive,
        [classes.mini]: mini
      })}
      {...getRootProps()}
    >
      <IconButton
        style={{pointerEvents: mini ? 'none' : 'unset'}}
        size={mini ? 'medium' : 'small'}
        color={isDragActive ? "primary" : "default"}
      >
        <InboxIcon className={mini ? '' : classes.dropIcon}  />
      </IconButton>

      <input {...getInputProps()} /> {/*is hidden*/}

      <Typography
        variant={mini ? "caption" : "h6"}
        color="textSecondary"
        style={{whiteSpace: 'nowrap', paddingRight: 10}}
      >
        {
          isDragActive ?
            'Drop the files here' :
            CTA || `Drag ${acceptExtensions.map(i => i.toUpperCase()+'s').join(',')} here. Click to select files.`
        }
      </Typography>
    </div>
  );
});
FileDropSelector.defaultProps = {
  acceptExtensions: ['pdf']
};
