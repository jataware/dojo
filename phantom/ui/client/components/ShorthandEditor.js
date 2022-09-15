import React, { useEffect } from 'react';

import { LinearProgress } from '@material-ui/core';

import { useConfigs, useDirective, } from './SWRHooks';

const shorthandRef = React.createRef();

const _sendPostMessage = (msg) => {
  console.log('sending post message to shorthand:', msg);
  if (shorthandRef && shorthandRef.current) {
    shorthandRef.current.contentWindow.postMessage(JSON.stringify(msg), '*');
  }
};

const shorthandShouldSave = () => {
  _sendPostMessage({ type: 'save_clicked' });
};

const shorthandShouldLoad = (e) => {
  if (!e.editor_content || !e.content_id) {
    return; // not sending empty message
  }
  _sendPostMessage({
    type: 'file_opened',
    editor_content: e.editor_content,
    content_id: e.content_id,
    cwd: e.cwd,
  });
};

function ShorthandEditor({
  isSaving,
  mode,
  modelInfo,
  setIsSaving,
  setIsShorthandOpen,
  shorthandContents,
}) {
  useEffect(() => {
    // isSaving is triggered by the parent's save button
    if (isSaving) {
      // now we send a message to the shorthand app telling it to save
      shorthandShouldSave();
    }
  }, [isSaving]);

  const { mutateDirective } = useDirective(modelInfo.id);
  const { mutateConfigs } = useConfigs(modelInfo.id);

  const editorUrl = `/api/shorthand/?model=${modelInfo.id}&mode=${mode}`;

  useEffect(() => {
    const registerListeners = () => {
      window.onmessage = function shorthandOnMessage(e) {
        let postMessageBody;

        try {
          postMessageBody = JSON.parse(e.data);
        } catch {
          return; // not a json event
        }

        switch (postMessageBody.type) {
          case 'editor_loaded':
            // editor has loaded, send in the contents
            shorthandShouldLoad(shorthandContents);
            break;
          case 'params_saved':
            if (mode === 'directive') {
              // shorthand sets the directive, so we just want to tell SWR to update it
              // but we need this timeout or the change may not have taken place yet
              // because ES does not guarantee immediate updates
              setTimeout(() => mutateDirective(), 1000);
            } else if (mode === 'config') {
              setTimeout(() => mutateConfigs(), 1000);
            }
            // tell the parent that we are done saving
            setIsSaving(false);
            // close the full screen dialog
            setIsShorthandOpen(false);
            break;
          case 'params_not_saved':
            setIsShorthandOpen(true); // keep shorthand open
            setIsSaving(false); // stop the saving spinner
            break;
          default:
            // stop the spinner and throw an error
            setIsSaving(false);
            throw new Error(`There was an error: ${postMessageBody}`);
        }
      };
    };

    registerListeners();
  }, [
    mutateDirective,
    setIsSaving,
    setIsShorthandOpen,
    mode,
    shorthandContents,
    mutateConfigs,
  ]);

  return (
    <div>
      { isSaving ? <LinearProgress /> : null }
      <iframe
        id="shorthand"
        title="shorthand"
        style={{ height: 'calc(100vh - 70px)', width: '100%' }}
        src={editorUrl}
        ref={shorthandRef}
      />
    </div>
  );
}

export default ShorthandEditor;
