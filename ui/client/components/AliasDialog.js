import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  buttons: {
    backgroundColor: '#C8C8C8',
  },
  spanSpacing: {
    marginRight: '10px',
  },
}));

function AliasDialog({ column }) {
  const { classes } = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>

      <Button
        className={classes.buttons}
        onClick={() => setOpen(true)}
      >
        Aliases:

      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >

        <div>

          {column?.alias
            && (
            <div style={{ padding: '20px' }}>
              <Typography
                className={classes.header}
                component="h6"
                align="center"
              >
                <b>{column.name.toUpperCase()}</b> <br /> Aliases:
              </Typography>
              <br />
              <ul style={{ padding: '10px' }}>

                {Object.keys(column?.alias).map((keyValue) => (
                  <li key={keyValue.toString().concat('aliases')}>
                    <span className={classes.spanSpacing}>
                      <b>Current : </b>
                      {keyValue.toString()}
                    </span>
                    <b>New : </b>
                    {column.alias[keyValue].toString()}
                  </li>
                ))}

              </ul>
            </div>
            )}

        </div>
      </Dialog>

    </div>
  );
}

export default AliasDialog;
