import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

import { makeStyles } from 'tss-react/mui';

import CollapseText from './CollapseText';

const useStyles = makeStyles()((theme) => ({
  buttons: {
    backgroundColor: 'transparent',
    border: '2px solid black',
    color: 'black',
    padding: theme.spacing(1, 1, 1),
    margin: theme.spacing(1, 1, 1),
    cursor: 'pointer',
    '&:hover': {
      background: '#f8f8ff', // <- add here your desired color, for demonstration purposes I chose red
    }
  },

  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),

  },
}));

function GeographyListModal({ geography }) {
  const { classes } = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  if (!geography?.country.length) {
    return (
      <Typography
        component="div"
        align="right"
      >
        No countries found
      </Typography>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <Button
          className={classes.buttons}
          onClick={() => setOpen(true)}
          align="right"
          color="grey"
        >
          Detailed Admin Levels:
        </Button>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div>
            <Typography
              className={classes.header}
              component="h6"
              align="center"
            >
              <b> Countries: </b>
            </Typography>
            <Typography
              component="div"
            >
              <CollapseText childrenText={geography?.country.join(', ')} collapsedSize={65} />
            </Typography>
            {geography?.admin1?.length > 0
                    && (
                    <div>
                      <Typography
                        className={classes.header}
                        component="h6"
                        align="center"
                      >
                        <b> Admin 1: </b>
                      </Typography>
                      <Typography
                        component="div"
                      >
                        <CollapseText childrenText={geography?.admin1.join(', ')} collapsedSize={65} />
                      </Typography>
                    </div>
                    )}
            {geography?.admin2?.length > 0
                    && (
                    <div>
                      <Typography
                        className={classes.header}
                        component="h6"
                        align="center"
                      >
                        <b> Admin 2: </b>
                      </Typography>
                      <Typography
                        component="div"
                      >
                        <CollapseText childrenText={geography?.admin2.join(', ')} collapsedSize={65} />
                      </Typography>
                    </div>
                    )}
            {geography?.admin3?.length > 0
                && (
                <div>
                  <Typography
                    className={classes.header}
                    component="h6"
                    align="center"
                  >
                    <b> Admin 3: </b>
                  </Typography>
                  <Typography
                    component="div"
                  >
                    <CollapseText childrenText={geography?.admin3.join(', ')} collapsedSize={65} />
                  </Typography>
                </div>
                )}
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export default GeographyListModal;
