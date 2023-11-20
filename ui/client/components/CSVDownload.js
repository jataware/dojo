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

import { useTheme } from '@mui/material/styles';

import { makeStyles } from 'tss-react/mui';

import BasicAlert from './BasicAlert';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '114px',
  },
  leftIndent: {
    marginLeft: theme.spacing(2),
  },
  radioGroup: {
    flexDirection: 'row',
  },
}));

function CSVDownload({ resource, index = 'indicators' }) {
  const [openDownload, setDownload] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [csvChoice, setCsvChoice] = useState('wide');

  const theme = useTheme();
  const { classes } = useStyles();

  const handleChange = (event) => {
    setCsvChoice(event.target.value);
  };

  const isRawChoice =  index === 'indicators' && csvChoice === 'raw';

  const downloadURI = isRawChoice ?
    `/api/dojo/indicators/${resource.id}/download` :
    `/api/dojo/dojo/download/csv/${index}/${resource.id}?wide_format=${csvChoice === 'wide'}`;

  const conditionalCSVProps = isRawChoice ? {} : {
    download: `${resource.id}_${csvChoice}.csv`,
    type: 'text/csv'
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
        Download Files
      </Button>

      <Collapse 
        in={formOpen}
        timeout={theme.transitions.duration.shortest}
        >
        <div className={classes.leftIndent}>
          <form>
            <RadioGroup
              aria-label="csvValue"
              name="csvValue"
              value={csvChoice}
              onChange={handleChange}
              className={classes.radioGroup}
            >
              <FormControlLabel value="wide" control={<Radio />} label="Wide CSV" />
              <FormControlLabel value="long" control={<Radio />} label="Long CSV" />
              <FormControlLabel value="raw" control={<Radio />} label="Raw Data" />
            </RadioGroup>

            <Typography variant="body2">
              <Button
                variant="contained"
                disableElevation
                color="primary"
                href={downloadURI}
                onClick={() => setDownload(true)}
                disabled={openDownload ? true : false}
                className={classes.leftIndent}
                {...conditionalCSVProps}
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
