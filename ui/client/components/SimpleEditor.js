import React from 'react';

import TextareaAutosize from '@material-ui/core/TextareaAutosize';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  textareaAutosize: {
    overflow: 'auto',
    height: '200px',
    width: '100%',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 0,

    '&:focus': {
      outlineColor: '#fff',
      outlineWidth: 0,
      boxShadow: '0 0 10px #0c0c0c',
    }
  }
}));

const SimpleEditor = ({ editorContents, setEditorContents }) => {
  const classes = useStyles();

  const updateEditorContents = (e) => {
    setEditorContents((state) => ({
      ...state, text: e.target.value
    }));
  };

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignContent: 'stretch',
        alignItems: 'flex-start',
        marginBottom: '10px',
      }}
      >
        <TextareaAutosize
          rowsMin={30}
          placeholder=""
          value={editorContents?.text || ''}
          onChange={updateEditorContents}
          className={classes.textareaAutosize}
        />
      </div>
    </div>
  );
};

export default SimpleEditor;
