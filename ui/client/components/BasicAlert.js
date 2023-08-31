import React from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const BasicAlert = ({
  alert, visible, setVisible, action, disableClickaway, ...props
}) => {
  const { message, severity } = alert;

  const handleAlertClose = (event, reason) => {
    // disable clicking outside the alert to close it
    if (disableClickaway && (reason === 'clickaway')) {
      return;
    }

    setVisible(false);
  };

  // autoHideDuration={null} passed as a prop will work to keep BasicAlert open forever
  return (
    <Snackbar
      open={visible}
      autoHideDuration={6000}
      onClose={handleAlertClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      {...props}
    >
      <Alert elevation={6} variant="filled" severity={severity} action={action}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default BasicAlert;
