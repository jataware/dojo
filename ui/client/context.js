import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { v4 as uuidv4 } from 'uuid';

export const WebSocketContext = createContext({});
export const WebSocketUpdateContext = createContext({});
export const useWebSocketContext = () => useContext(WebSocketContext);
export const useWebSocketUpdateContext = () => useContext(WebSocketUpdateContext);

export const WebSocketContextProvider = ({ url, children }) => {
  const ws = useRef(new WebSocket(url));
  const Q = useRef({});
  const clientId = useRef(null);

  const dispatch = (channel, payload) => {
    const { [channel]: xs = [] } = Q.current;
    xs.forEach((d) => {
      d.call(undefined, payload);
    });
  };

  const setWebSocketId = (id) => {
    clientId.current = id;
    console.log(`New Client ID ${clientId.current}`);
  };

  const sleep = async (t) => new Promise((r) => setTimeout(r, t));

  const getWebSocketId = () => clientId.current;

  const emit = async (channel, payload) => {
    while (ws.current.readyState === ws.current.CONNECTING) {
      await sleep(50); // eslint-disable-line no-await-in-loop
    }
    ws.current.send(JSON.stringify({ channel, payload }));
  };

  const unregister = (channel, handler) => {
    // eslint-disable-next-line eqeqeq
    Q.current[channel] = (Q.current[channel] ?? []).filter((h) => h != handler);
    if (!Q.current[channel].length) {
      delete Q.current[channel];
    }
  };

  const register = (channel, handler) => {
    unregister(channel, handler);
    Q.current[channel] = [...Q.current[channel] ?? [], handler];
    return () => unregister(channel, handler);
  };

  const awaitEmit = async (channel, payload, responseChannel) => {
    let handler = null;

    // socket promise
    const p1 = new Promise((r) => {
      handler = (d) => r(d);
      register(responseChannel, handler);
      emit(channel, payload);
    });

    // timeout
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`awaitEmit:: Timeout waiting for response on ${responseChannel}`));
      }, 3000);
    });

    const resp = await Promise.race([p2, p1]).finally(() => {
      // cleanup handlers
      if (handler !== null) {
        unregister(responseChannel, handler);
      }
    });

    console.log(`Resolved response in: ${channel}, out: ${responseChannel}, resp: ${resp}`);
    return resp;
  };

  useEffect(async () => {
    console.log('websocket connecting...');
    // ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log('ws opened');
    };
    ws.current.onerror = (evt) => {
      console.log(`ws error ${evt}`);
    };
    ws.current.onclose = () => {
      console.log('ws closed');
    };

    ws.current.onmessage = async (evt) => {
      console.log(evt.data);
      const data = JSON.parse(evt.data);

      if (data.channel === 'id') {
        setWebSocketId(data.payload);
      } else {
        dispatch(data.channel, data.payload);
      }
    };

    return async () => {
      console.log('websocket disconnecting');
      ws.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ emit, awaitEmit }}>
      <WebSocketUpdateContext.Provider value={{ getWebSocketId, register, unregister }}>
        { children }
      </WebSocketUpdateContext.Provider>
    </WebSocketContext.Provider>
  );
};

const useStateWithLocalStorage = (localStorageKey, init) => {
  const [value, setValue] = React.useState(
    JSON.parse(localStorage.getItem(localStorageKey)) || init
  );

  React.useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
};

export const HistoryContext = createContext({});
export const HistoryUpdateContext = createContext({});

export const useHistoryContext = () => useContext(HistoryContext);

export const useHistoryUpdateContext = () => useContext(HistoryUpdateContext);

export const HistoryContextProvider = ({ children }) => {
  // const [history, updateHistory] = useState(() => []);
  const [history, updateHistory] = useStateWithLocalStorage('historyItems', []);
  const runCommand = useRef('');

  function clearHistoryContext() {
    updateHistory([]);
  }

  function setRunCommand(s) {
    runCommand.current = s;
  }

  function historyIgnore(cmd) {
    return ['ls', 'll', 'pwd', 'clear'].includes(cmd);
  }

  function addHistoryItem(item) {
    if (historyIgnore(item.text)) {
      return;
    }
    if (item.text === runCommand?.current) {
      item.runCommand = true; // eslint-disable-line no-param-reassign
      setRunCommand('');
    }
    updateHistory((prevHistory) => {
      const hist = prevHistory.map((x) => {
        if (item.runCommand) {
          delete x.runCommand; // eslint-disable-line no-param-reassign
        }
        return x;
      });
      return [...hist, { ...item, id: uuidv4() }];
    });
  }

  function markRunCommand(item, enable) {
    updateHistory(history.map((x) => {
      if (enable && x.id === item.id) {
        x.runCommand = true; // eslint-disable-line no-param-reassign
      } else {
        delete x.runCommand; // eslint-disable-line no-param-reassign
      }
      return x;
    }));
  }

  function removeHistoryItem(item) {
    updateHistory(history.filter((x) => x.id !== item.id));
  }

  return (
    <HistoryContext.Provider value={history}>
      <HistoryUpdateContext.Provider value={{
        addHistoryItem, removeHistoryItem, clearHistoryContext, markRunCommand, setRunCommand
      }}
      >
        { children }
      </HistoryUpdateContext.Provider>
    </HistoryContext.Provider>

  );
};

export const ContainerInfoContext = createContext({});
export const ContainerInfoUpdateContext = createContext({});
export const useContainerInfoContext = () => useContext(ContainerInfoContext);
export const useContainerInfoUpdateContext = () => useContext(ContainerInfoUpdateContext);
export const ContainerInfoContextProvider = ({ children }) => {
  const [containerInfo, updateContainerInfo] = useState(() => {});

  const fetchContainerInfo = async () => {
    const respID = await fetch('/api/container/ops/container');
    const { id } = await respID.json();
    console.log(`set containerID ${id}`);

    const respName = await fetch(`/api/docker/inspect/${id}`);
    const { Name } = await respName.json();
    const name = Name?.substring(1) ?? '';
    console.log(`set container Name ${name}`);

    updateContainerInfo((prevInfo) => ({ ...prevInfo, id, name }));
  };

  useEffect(() => {
    fetchContainerInfo();
  }, []);

  return (
    <ContainerInfoContext.Provider value={containerInfo}>
      <ContainerInfoUpdateContext.Provider value={{ fetchContainerInfo, updateContainerInfo }}>
        { children }
      </ContainerInfoUpdateContext.Provider>
    </ContainerInfoContext.Provider>
  );
};
