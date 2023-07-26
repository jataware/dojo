import React, { useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';

import { makeStyles, useTheme } from '@mui/material/styles';

import BasicAlert from './BasicAlert';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '114px',
  },
  leftIndent: {
    marginLeft: theme.spacing(3),
  },
  radioGroup: {
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
}));

function CSVDownload({ resource, index = 'indicators' }) {
  const [openDownload, setDownload] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [csvChoice, setCsvChoice] = useState('wide');
  const name = `${resource.id}.csv`;

  const theme = useTheme();
  const classes = useStyles();

  const handleChange = (event) => {
    setCsvChoice(event.target.value);
  };

  return (
    <div className={classes.root}>
      <Button
        variant="outlined"
        color="primary"
        endIcon={formOpen ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
        onClick={() => setFormOpen(!formOpen)}
        style={{ border: 'none' }}
      >
        Download CSV
      </Button>

      <Collapse in={formOpen} timeout={theme.transitions.duration.shortest}>
        <div className={classes.leftIndent}>
          <form>
            <RadioGroup
              aria-label="csvValue"
              name="csvValue"
              value={csvChoice}
              onChange={handleChange}
              className={classes.radioGroup}
            >
              <FormControlLabel value="wide" control={<Radio />} label="Wide" />
              <FormControlLabel value="long" control={<Radio />} label="Long" />
            </RadioGroup>

            <Typography variant="body2">
              <Button
                variant="contained"
                disableElevation
                color="primary"
                href={`/api/dojo/dojo/download/csv/${index}/${resource.id}?wide_format=${csvChoice === 'wide'}`}
                download={name}
                type="text/csv"
                onClick={() => setDownload(true)}
                disabled={openDownload ? true : undefined}
                className={classes.leftIndent}
              >
                Download
              </Button>
            </Typography>
          </form>
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
        </div>
      </Collapse>
    </div>
  );
}

export default CSVDownload;
