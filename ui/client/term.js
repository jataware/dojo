import React, { useEffect, useRef, useContext } from 'react'; // eslint-disable-line no-unused-vars

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useWebSocketContext, useWebSocketUpdateContext } from './context';

require('xterm/css/xterm.css');

const Term = ({ setSocketIoConnected }) => {
  const { emit } = useWebSocketContext();
  const { register, unregister } = useWebSocketUpdateContext();
  const termRef = useRef(null);

  useEffect(async () => {
    const term = new Terminal({ cursorBlink: true });

    term.setOption('logLevel', 'debug');
    const fitAddon = new FitAddon();

    console.log('loading terminal');

    term.onData(async (data) => {
      console.log(`-> ${data}`);
      await emit('xterm', data);
    });

    const xtermHandler = (d) => {
      console.log(`<- ${d}`);
      term.write(d);
    };

    register('xterm', xtermHandler);

    setSocketIoConnected(true);

    await emit('terminal/resize', JSON.stringify({ cols: term.cols, rows: term.rows }));
    await emit('ssh', 'connect');
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();
    console.log({ cols: term.cols, rows: term.rows });

    return () => {
      unregister('xterm', xtermHandler);
    };
  }, []);

  return (
    <div className="terminal-container" ref={termRef} />
  );
};

export default Term;
