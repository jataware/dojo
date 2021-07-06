import React from 'react';

import { LinearProgress } from '@material-ui/core';

const shorthandRef = React.createRef();

export const ShorthandEditor = ({ modelInfo, isSaving, mode }) => {
  const editorUrl = `/api/shorthand/?model=${modelInfo.id}&mode=${mode}`;

  return (
    <div>
      { isSaving ? <LinearProgress /> : null }
      <iframe id="shorthand" title="shorthand" style={{ height: 'calc(100vh - 70px)', width: '100%' }} src={editorUrl} ref={shorthandRef} />
    </div>
  );
};

const _sendPostMessage = (msg) => {
  console.log('sending post message to shorthand:', msg);
  if (shorthandRef && shorthandRef.current) {
    shorthandRef.current.contentWindow.postMessage(JSON.stringify(msg), '*');
  }
};

export const shorthandShouldSave = () => {
  _sendPostMessage({ type: 'save_clicked' });
};

export const shorthandShouldLoad = (e) => {
  if (!e.editor_content || !e.content_id) {
    return; // not sending empty message
  }
  _sendPostMessage({
    type: 'file_opened',
    editor_content: e.editor_content,
    content_id: e.content_id,
  });
};
