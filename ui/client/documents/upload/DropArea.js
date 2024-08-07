import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { makeStyles } from 'tss-react/mui';

import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import Typography from '@mui/material/Typography';

import BasicAlert from '../../components/BasicAlert';

const useStyles = makeStyles()((theme) => ({
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
}));

const extensionMap = {
  pdf: {
    'application/pdf': ['.pdf'],
  },
  csv: {
    'text/csv': ['.csv'],
  },
  xls: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xls']
  },
  xlsx: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  },
  docx: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  doc: {
    'application/msword': ['.doc']
  },
  odt: {
    'application/vnd.oasis.opendocument.text': ['.odt']
  },
  odp: {
    'application/vnd.oasis.opendocument.presentation': ['.odp']
  },
  ppt: {
    'application/vnd.ms-powerpoint': ['.ppt']
  },
  pptx: {
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
  }
};

export function formatExtensionForDropZone(extensionsArray) {
  return extensionsArray.reduce((acc, extension) => {
    // Optional preceding dot . for extension removed
    const buff = extension.replace(/^\./g, '');

    return { ...acc, ...extensionMap[buff] };
  }, {});
}

export const FileDropSelector = ({
  onFileSelect,
  acceptExtensions,
  mini,
  CTA,
  multiple = true,
  disableSelector,
  maxFiles = 10
}) => {
  const { classes, cx } = useStyles();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const onDropFilesRejected = (fileRejections) => {
    let errorMessage = 'There was an issue with your file upload: ';

    if (fileRejections.length > maxFiles) {
      errorMessage += `The upload limit is ${maxFiles} files. Please try again with fewer files.`;
    } else if (fileRejections[0].errors) {
      errorMessage += fileRejections[0].errors.map((item) => item?.message).join('; ');
    } else {
      errorMessage += `Your file(s) could not be processed.
        Please check that the number of files and the file extension(s) are correct.`;
    }

    setAlertMessage(errorMessage);
    setAlertVisible(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: onFileSelect,
    multiple,
    onDropRejected: onDropFilesRejected,
    accept: formatExtensionForDropZone(acceptExtensions),
    maxFiles,
    disabled: disableSelector,
  });

  useEffect(() => {
    // stop default browser drag and drop behavior when we want to disable the drop area
    // eg when the user has added the max number of files
    const preventDefaultDragAndDrop = (e) => {
      e.preventDefault();
    };

    if (disableSelector) {
      window.addEventListener('dragover', preventDefaultDragAndDrop);
      window.addEventListener('drop', preventDefaultDragAndDrop);
    }

    if (!disableSelector) {
      window.removeEventListener('dragover', preventDefaultDragAndDrop);
      window.removeEventListener('drop', preventDefaultDragAndDrop);
    }

    return () => {
      window.removeEventListener('dragover', preventDefaultDragAndDrop);
      window.removeEventListener('drop', preventDefaultDragAndDrop);
    };
  }, [disableSelector]);

  const getUploadMessage = () => {
    if (isDragActive) {
      return 'Drop the files here';
    }

    if (disableSelector) {
      return (
        <>
          Upload limit of 10 documents reached. <br />
          Please complete your annotations and start another bulk upload to upload more.
        </>
      );
    }

    return CTA || 'Drag files here. Click to select up to ten files.';
  };

  return (
    <div
      className={cx({
        [classes.root]: true,
        [classes.dropActive]: isDragActive,
        [classes.mini]: mini
      })}
      {...getRootProps()}
    >
      <IconButton
        style={{ pointerEvents: mini ? 'none' : 'unset' }}
        size={mini ? 'medium' : 'small'}
        color={isDragActive ? 'primary' : 'default'}
        disabled={disableSelector}
      >
        <InboxIcon className={mini ? '' : classes.dropIcon} />
      </IconButton>

      <input {...getInputProps()} /> {/* is hidden*/}

      <Typography
        variant={mini ? 'caption' : 'h6'}
        color="textSecondary"
        style={{ whiteSpace: 'nowrap', paddingRight: 10 }}
        align="center"
      >
        {getUploadMessage()}
      </Typography>
      <BasicAlert
        alert={{ message: alertMessage, severity: 'warning' }}
        visible={alertVisible}
        setVisible={setAlertVisible}
      />
    </div>
  );
};
FileDropSelector.defaultProps = {
  acceptExtensions: ['pdf']
};
