import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import AddBoxIcon from '@mui/icons-material/AddBox';
import CloseIcon from '@mui/icons-material/Close';
import ComputerIcon from '@mui/icons-material/Computer';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

import { makeStyles } from 'tss-react/mui';

import ChatCard from './ChatCard';

const useStyles = makeStyles()((theme) => ({
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
          const displayReference = `[${Number(number) + 1}]`;

          return (
            // eslint-disable-next-line react/no-array-index-key
            <Tooltip key={i} arrow title={details[number]?.paragraph}>
              <span style={{ cursor: 'default' }}>{displayReference}</span>
            </Tooltip>
          );
        }
        return part;
      })}
    </div>
  );
};

const Title = ({ title }) => {
  if (!title) return 'No Title';

  if (title.length <= 26) return title;

  const truncateAtWord = (str, maxLength) => {
    // Try to find the index of the next space after maxLength
    const nextSpaceIndex = str.indexOf(' ', maxLength);

    // If there's no next space, truncate at maxLength
    if (nextSpaceIndex === -1) return str.substring(0, maxLength);

    // Else truncate at the next space
    return str.substring(0, nextSpaceIndex);
  };

  return (
    <Tooltip title={title}>
      <span style={{ cursor: 'default' }}>{`${truncateAtWord(title, 26)} [...]`}</span>
    </Tooltip>
  );
};

const AIAssistantResponse = ({
  text, details, documents
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

  const buttonContent = () => {
    console.log('this is documents', documents, 'and details', details)
    if (!details && !documents) {
      return (
        <Button
          variant="text"
          disabled
          startIcon={<CircularProgress size={16} color="inherit" />}
          sx={{ display: 'flex', margin: '16px auto 0' }}
        >
          Details Loading
        </Button>
      );
    }
    if (Array.isArray(details) && details.length === 0) {
      return (
        <Button
          variant="text"
          disabled
          startIcon={<DoNotDisturbIcon />}
          sx={{ display: 'flex', margin: '16px auto 0' }}
        >
          No Details Found
        </Button>
      );
    }
    if (details && documents) {
      return (
        <Button
          variant="text"
          onClick={() => setShowDetails(!showDetails)}
          startIcon={showDetails ? <IndeterminateCheckBoxIcon /> : <AddBoxIcon />}
          sx={{ display: 'flex', margin: '16px auto 0' }}
        >
          Show Details
        </Button>
      );
    }
  };

  return (
    <>
      <ChatCard
        backgroundColor="grey.100"
        icon={<ComputerIcon fontSize="large" />}
        text={<AnswerText text={text} details={details} />}
      >
        <div className={classes.showDetailsWrapper}>
          {buttonContent()}
          {(details && documents) && (
            <Collapse in={showDetails}>
              <div className={classes.details}>
                {details.map((para, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={`${para.document_id}/${i}`}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: 'contents',
                      }}
                      component="div"
                    >
                      <div>
                        [{i + 1}]
                      </div>
                      <div>
                        <div>
                          {para.paragraph}
                        </div>
                        <div className={classes.paragraphDetails}>
                          <span>
                            Title: <Title title={documents[para.document_id]?.title} />
                          </span>
                          <Divider orientation="vertical" flexItem />
                          <span>Paragraph # in file: {para.paragraph_idx}</span>
                          <Divider orientation="vertical" flexItem />
                          <Button
                            variant="text"
                            onClick={() => handlePDFClick(documents[para.document_id])}
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
          )}
        </div>
      </ChatCard>
      <DocumentViewerDialog
        documentDetails={dialogContent}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

export default AIAssistantResponse;
