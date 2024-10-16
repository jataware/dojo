import React, { useEffect, useState } from 'react';

import axios from 'axios';

import CircularProgress from '@mui/material/CircularProgress';
import isEmpty from 'lodash/isEmpty';
import startCase from 'lodash/startCase';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';

const fetchDocumentFullText = async (documentId) => {
  // paragraph id format: documentId-<paragraphIndex>
  const url = `/api/dojo/documents/${documentId}/paragraphs?size=200`;

  const response = await axios.get(url);
  return response.data.paragraphs;
};

/**
 *
 **/
export const ViewDocumentDialog = ({ doc, onClose }) => {
  const document = doc || {};
  const [documentText, setDocumentText] = useState(null);
  const [documentTextLoading, setDocumentTextLoading] = useState(null);

  useEffect(() => {
    if (!doc?.id) {
      return;
    }

    setDocumentTextLoading(true);

    fetchDocumentFullText(doc.id)
      .then((response) => {
        setDocumentText(response);
      })
      .finally(() => setDocumentTextLoading(false));
  }, [doc]);

  return (
    <Dialog
      open={Boolean(doc)}
      onClose={onClose}
      maxWidth="md"
    >
      <DialogTitle style={{ paddingBottom: 1 }}>
        {document.title}
      </DialogTitle>

      <Divider
        variant="fullWidth"
        style={{ margin: '0.5rem 0' }}
      />

      <DialogContent>
        {!isEmpty(doc) && (
          <dl>
            {['publisher', 'creation_date', 'type', 'original_language',
              'classification', 'producer', 'stated_genre', 'id', 'description']
              .map((item) => (document[item] ? (
                <div key={item}>
                  <dt>{startCase(item)}</dt>
                  <dd>{document[item]}</dd>
                </div>
              ) : null))}
          </dl>
        )}

        {documentTextLoading ? (
          <CircularProgress />
        ) : documentText?.length ? (
          <div>
            <p>Full Text</p>
            {documentText.map((paragraph) => Boolean(paragraph) && (
            <DialogContentText key={paragraph.id}>
              {paragraph.text}
            </DialogContentText>
            ))}
            {documentText.length > 200 && (
              <p>Document continues. Truncated to 200 lines.</p>
            )}
          </div>
        ) : (
          <p>Document only contains metadata fields. Does not have text contents.</p>
        )}

      </DialogContent>

    </Dialog>
  );
};
