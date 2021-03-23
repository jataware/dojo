import React, { useEffect, useRef, useContext } from 'react'; // eslint-disable-line no-unused-vars

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { useSocketIOClient } from './context';

require('xterm/css/xterm.css');

const Term = ({ setSocketIoConnected }) => {
  const ioclient = useSocketIOClient();
  const termRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    console.log('loading terminal');
    ioclient.on('connect', () => {
      setSocketIoConnected(true);
      term.write('\r\n*** Connected to backend ***\r\n');
    });

    term.onKey(({ key }) => {
      ioclient.emit('terminal', key);
    });

    ioclient.on('terminal', (data) => {
      term.write(data);
    });

    ioclient.on('disconnect', () => {
      setSocketIoConnected(false);
      term.write('\r\n*** Disconnected from backend ***\r\n');
    });
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();
  }, []);

  return (
    <div className="terminal-container" ref={termRef} />
  );
};

export default Term;
