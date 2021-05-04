import React, {
  useCallback, useEffect, useRef
} from 'react'; // eslint-disable-line no-unused-vars

import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';

import { useWebSocketContext, useWebSocketUpdateContext } from '../context';

require('xterm/css/xterm.css');

const Term = () => {
  const { emit } = useWebSocketContext();
  const { register, unregister } = useWebSocketUpdateContext();
  const termRef = useRef(null);
  const term = useRef(null);
  const fitAddon = new FitAddon();

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
      term.current.write(d);
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
    <div className="terminal-container" ref={termRef} />
  );
};

export default Term;
