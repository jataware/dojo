import React, { useEffect, useRef, useContext } from 'react'; // eslint-disable-line no-unused-vars

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useWebSocketContext, useWebSocketUpdateContext } from './context';

require('xterm/css/xterm.css');

const Term = ({ setSocketIoConnected }) => {
  const { emit } = useWebSocketContext();
  const { register, unregister } = useWebSocketUpdateContext();
  const termRef = useRef(null);
  const term = useRef(null);

  useEffect(async () => {
    term.current = new Terminal({ cursorBlink: true });

    term.current.setOption('logLevel', 'debug');
    const fitAddon = new FitAddon();

    console.log('loading terminal');

    term.current.onData(async (data) => {
      console.log(`-> ${data}`);
      await emit('xterm', data);
    });

    term.current.loadAddon(fitAddon);
    term.current.open(termRef.current);
    fitAddon.fit();
  }, []);

  useEffect(async () => {
    const xtermHandler = (d) => {
      console.log(`<- ${d}`);
      term.current.write(d);
    };

    register('xterm', xtermHandler);

    console.log({ cols: term.current.cols, rows: term.current.rows });
    await emit('terminal/resize', JSON.stringify({ cols: term.current.cols, rows: term.current.rows }));
    await emit('ssh', 'connect');
    setSocketIoConnected(true);

    return () => {
      unregister('xterm', xtermHandler);
    };
  }, []);

  return (
    <div className="terminal-container" ref={termRef} />
  );
};

export default Term;
