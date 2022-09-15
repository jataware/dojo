import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import BasicAlert from './BasicAlert';

function DatasetDownload({ dataset, className }) {
  const [openDownload, setDownload] = useState(false);
  return (
    <>

      <Typography variant="body2" className={className}>
        <Button
          variant="outlined"
          color="primary"
          href={`/api/dojo/indicators/${dataset.id}/download/csv`}
          download={`${dataset.id}.csv`}
          type="text/csv"
          onClick={() => setDownload(true)}
          disabled={openDownload ? true : undefined}
        >
          Download Dataset
        </Button>
      </Typography>
      <BasicAlert
        alert={
          {
            message: 'Please wait; Download may take a moment to start.',
            severity: 'info'
          }
        }
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        visible={openDownload}
        setVisible={setDownload}
        autoHideDuration={null}
        disableClickaway
        action={(
          <IconButton
            color="inherit"
            onClick={() => setDownload(false)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      />
    </>
  );
}

export default DatasetDownload;
