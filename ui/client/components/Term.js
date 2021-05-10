import React, {
  useCallback, useEffect, useRef
} from 'react'; // eslint-disable-line no-unused-vars

import Box from '@material-ui/core/Box';

import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';

import { useWebSocketContext, useWebSocketUpdateContext } from '../context';

require('xterm/css/xterm.css');

// eslint-disable-next-line no-unused-vars
class TermHelperAddon {
  constructor(setABoxState) {
    this._term = null;
    this._setABoxState = setABoxState;
  }

  activate(term) {
    console.log('addon activate');
    this._term = term;
    this._active = true;
  }

  currentRow() {
    if (!this._active) { return 0; }
    return this._term.buffer.active.cursorY;
  }

  currentRowText() {
    if (!this._active) { return ''; }
    const curY = this._term.buffer.active.cursorY;
    const buffline = this._term.buffer.active.getLine(curY);
    return buffline.translateToString().trim();
  }

  currsorRect() {
    if (!this._active) { return {}; }
    return this._term.textarea.getBoundingClientRect();
  }

  update() {
    if (this._active) {
      this._setABoxState({ text: this.currentRowText(), rect: this.currsorRect() });
    }
  }

  dispose() {
    this._active = false;
    console.log('addon deactivate');
  }
}

/*
  Sample of attaching to Term Cursor
  @rect - rectangle of cursor
  @text - term current line of text
*/
// eslint-disable-next-line no-unused-vars
const ABox = ({ rect, text }) => {
  const [style, setStyle] = React.useState({
    height: 100,
    width: 200,
    backgroundColor: '#000',
    color: '#fff',
    position: 'absolute',
    opacity: 0.8,
    zIndex: 100,
    display: 'none'
  });

  useEffect(() => {
    const x = rect.x + rect.width;
    const y = rect.y + rect.height;
    if (text.includes('python')) {
      setStyle({
        ...style, top: y, left: x, display: 'unset'
      });
    } else {
      setStyle({ ...style, display: 'none' });
    }
  }, [text, rect]);

  return (
    <Box style={style}>
      {text}
    </Box>
  );
};

const Term = () => {
  const { emit } = useWebSocketContext();
  const { register, unregister } = useWebSocketUpdateContext();
  const termRef = useRef(null);
  const term = useRef(null);
  const fitAddon = new FitAddon();
  // const [aBoxState, setABoxState] = React.useState({text: "", rect: {}});
  // const termHelperAddon = new TermHelperAddon(setABoxState);

  useEffect(() => {
    term.current = new Terminal({
      cursorBlink: true,
      theme: {
        foreground: '#fff',
        background: '#272d33',
      }
    });

    term.current.setOption('logLevel', 'debug');

    console.log('loading terminal');

    term.current.onData(async (data) => {
      console.log(`-> ${data}`);
      await emit('xterm', data);
    });

    term.current.loadAddon(fitAddon);
    // term.current.loadAddon(termHelperAddon);
    term.current.open(termRef.current);
    fitAddon.fit();
  }, []);

  const initTerm = useCallback(async () => {
    console.log({ cols: term.current.cols, rows: term.current.rows });
    await emit('terminal/resize', JSON.stringify({ cols: term.current.cols, rows: term.current.rows }));
    await emit('ssh', 'connect');
  }, []);

  useEffect(() => {
    const xtermHandler = (d) => {
      console.log(`<- ${d}`);
      term.current.write(d, () => {
        console.log('write done');
        /* exprimental
           termHelperAddon.update()
        */
      });
    };

    register('xterm', xtermHandler);
    initTerm();
    return (() => {
      console.log('ssh/disconnect');
      emit('ssh', 'disconnect');
      unregister('xterm', xtermHandler);
    });
  }, []);

  return (
    <>
      <div className="terminal-container" ref={termRef} />
      {/* <ABox {...aBoxState} /> */}
    </>
  );
};

export default Term;
