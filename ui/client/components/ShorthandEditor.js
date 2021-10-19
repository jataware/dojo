import React, { useEffect } from 'react';

import { LinearProgress } from '@material-ui/core';

import { useDirective } from './SWRHooks';

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
  });
};

function ShorthandEditor({
  containerId,
  directive,
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

  const editorUrl = `/api/shorthand/?model=${modelInfo.id}&mode=${mode}`;

  // TODO: can we set this directly with /dojo/directive?
  // Or does this clouseau setting do something on the backend that's necessary?
  // claudine/server/cato/httpd.go - cwd is marked as required, isn't set through dojo endpoint
  // could we get down to just one endpoint for setting directive for clarity?
  const markDirective = async (item) => {
    await fetch(`/api/clouseau/container/store/${containerId}/meta`, {
      method: 'PUT',
      body: JSON.stringify({ run_command: item.command, run_cwd: item.cwd })
    });
    // tell SWR to fetch the new directive from the server
    // we need this timeout or the change hasn't taken place yet
    setTimeout(() => mutateDirective(), 1000);
  };

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
            // mark the command as the run command (the directive)
            markDirective(directive);
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

  useEffect(() => {
    registerListeners();
  }, [shorthandContents, modelInfo, directive, mode]);

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
