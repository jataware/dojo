import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    margin: `${theme.spacing(2)} ${theme.spacing(4)}`,
  },
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  details: {
    display: 'grid',
    gridTemplateColumns: '3rem 1fr',
    gap: '1rem 0',
    marginTop: theme.spacing(2),
  },
  paragraphDetails: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    border: '1px solid #d7d7d7',
    marginTop: '0.5rem',
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: `0 ${theme.spacing(2)}`,
    alignItems: 'center',
  },
}));

const DocumentViewerDialog = ({
  documentDetails, open, handleClose
}) => {
  const { classes } = useStyles();
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg">
      <div className={classes.dialogHeader}>
        <Typography variant="h6">Document Viewer</Typography>
        <IconButton
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </div>
      {documentDetails && (
        <div style={{ height: '800px', width: '1200px', overflow: 'hidden' }}>
          <embed
            src={`/api/dojo/documents/${documentDetails?.id}/file`}
            type="application/pdf"
            alt="pdf"
            style={{ height: '100%', width: '1200px' }}
          />
        </div>
      )}
    </Dialog>
  );
};

const AnswerText = ({ text, details }) => {
  const embeddedNumber = /(\[\d+\])/;
  const parts = text.split(embeddedNumber);

  return (
    <div>
      {parts.map((part, i) => {
        const match = part.match(embeddedNumber);
        if (match) {
          /* TODO: match these to the correct reference - what is this reference?
            - also on click (expand and) scroll to the paragraph in the details section
            - in details section click to open document itself in sidebar or dialog or new tab
          */
          const number = match[0].slice(1, -1);

          return (
            // eslint-disable-next-line react/no-array-index-key
            <Tooltip key={i} arrow title={details[number]?.paragraph}>
              <span style={{ cursor: 'pointer' }}>{part}</span>
            </Tooltip>
          );
        }
        return part;
      })}
    </div>
  );
};

const AssistantChatCard = ({
  text, details, documents, response = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [open, setOpen] = useState(false);
  const { classes } = useStyles();

  const handleClose = () => {
    setDialogContent(null);
    setOpen(false);
  };

  const handlePDFClick = async (pdf) => {
    setDialogContent(pdf);
    setOpen(true);
  };

  return (
    <Paper
      variant="outlined"
      className={classes.paper}
      sx={{ backgroundColor: response ? 'grey.100' : 'white', }}
    >
      <div className={classes.mainContent}>
        {response ? <ComputerIcon fontSize="large" />
          : <AccountBoxIcon color="primary" fontSize="large" />}
        <Typography
          variant="body1"
          component="div"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          <AnswerText text={text} details={details} />
        </Typography>
      </div>
      {response && (
        <div className={classes.showDetailsWrapper}>
          <Button
            variant="text"
            onClick={() => setShowDetails(!showDetails)}
            startIcon={showDetails ? <IndeterminateCheckBoxIcon /> : <AddBoxIcon />}
            sx={{ display: 'flex', margin: '0 auto' }}
          >
            Show Details
          </Button>
          <Collapse in={showDetails}>
            <div className={classes.details}>
              {details.map((para, i) => (
                <React.Fragment key={`${para.root_name}/${para.paragraph_idx}`}>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'contents',
                    }}
                    component="div"
                  >
                    <div>
                      [{i}]
                    </div>
                    <div>
                      <div>
                        {para.paragraph}
                      </div>
                      <div className={classes.paragraphDetails}>
                        {/* TODO: concat name, show full name in tooltip */}
                        <span>Title: {documents[para.root_name]?.title || 'No Title'}</span>
                        <Divider orientation="vertical" flexItem />
                        <span>Paragraph # in file: {para.paragraph_idx}</span>
                        <Divider orientation="vertical" flexItem />
                        <Button
                          variant="text"
                          onClick={() => handlePDFClick(documents[para.root_name])}
                        >
                          View PDF
                        </Button>
                      </div>
                    </div>
                  </Typography>
                </React.Fragment>
              ))}
            </div>
          </Collapse>
        </div>
      )}
      <DocumentViewerDialog
        documentDetails={dialogContent}
        open={open}
        handleClose={handleClose}
      />
    </Paper>
  );
};

export default AssistantChatCard;
