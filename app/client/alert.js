import React from 'react';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

export const Alert = ({ alert, visible, setVisible }) => {
  const { message, severity } = alert;

  const handleAlertClose = async () => {
    setVisible(false);
  };

  return (
    <Snackbar open={visible} autoHideDuration={6000} onClose={handleAlertClose}>
      <MuiAlert elevation={6} variant="filled" severity={severity}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
