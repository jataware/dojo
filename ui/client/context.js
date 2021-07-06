import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { sleep } from './utils';

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
    console.info(`New Client ID ${clientId.current}`);
  };

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

    console.info(`Resolved response in: ${channel}, out: ${responseChannel}, resp: ${resp}`);
    return resp;
  };

  const closeSocket = () => {
    try {
      ws.current.close();
    } finally {
      console.debug('Websocket Close called');
    }
  };

  useEffect(() => {
    console.info('websocket connecting...');
    // ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.info('ws opened');
    };
    ws.current.onerror = (evt) => {
      console.debug(`ws error ${evt}`);
    };
    ws.current.onclose = () => {
      console.info('ws closed');
    };

    ws.current.onmessage = (evt) => {
      console.debug(evt.data);
      const data = JSON.parse(evt.data);

      if (data.channel === 'fatal') {
        console.error(`%cServer Error ${data.payload}`, 'background: #f00; color: #fff');
      }

      if (data.channel === 'id') {
        setWebSocketId(data.payload);
        return;
      }

      dispatch(data.channel, data.payload);
    };

    return () => {
      console.info('websocket disconnecting');
      closeSocket();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ emit, awaitEmit }}>
      <WebSocketUpdateContext.Provider value={{
        getWebSocketId, register, unregister, closeSocket
      }}
      >
        { children }
      </WebSocketUpdateContext.Provider>
    </WebSocketContext.Provider>
  );
};

export const HistoryContext = createContext({});
export const HistoryUpdateContext = createContext({});
export const useHistoryContext = () => useContext(HistoryContext);
export const useHistoryUpdateContext = () => useContext(HistoryUpdateContext);
export const HistoryContextProvider = ({ children }) => {
  const [historyContext, setHistoryContext] = useState(() => []);
  const [runCommand, setRunCommand] = useState(() => {});

  const fetchHistory = async (containerId) => {
    const resp = await fetch(`/api/dojo/clouseau/container/${containerId}/history`);
    if (resp.ok) {
      setHistoryContext(await resp.json());
    }
  };

  const fetchRunCommand = async (containerId) => {
    const resp = await fetch(`/api/dojo/clouseau/container/${containerId}/runcommand`);

    if (resp.ok) {
      setRunCommand(await resp.json());
    }
  };

  const markRunCommand = async (containerId, item) => {
    await fetch(`/api/clouseau/container/store/${containerId}/meta`, {
      method: 'PUT',
      body: JSON.stringify({ run_command: item.command, run_cwd: item.cwd })
    });
    setRunCommand(item);
  };

  const removeHistoryItem = async (containerId, item) => {
    const resp = await fetch(`/api/dojo/clouseau/container/${containerId}/history/${item.idx}`,
      { method: 'DELETE' });
    if (resp.ok) {
      await fetchHistory(containerId);
    }
  };

  return (
    <HistoryContext.Provider value={{ historyContext, runCommand }}>
      <HistoryUpdateContext.Provider value={{
        fetchHistory, removeHistoryItem, fetchRunCommand, markRunCommand
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
export const ContainerInfoContextProvider = ({ workerNode, children }) => {
  const [containerInfo, updateContainerInfo] = useState(() => {});

  const fetchContainerInfo = async () => {
    try {
      const respID = await fetch(`/api/clouseau/container/${workerNode}/ops/container`);
      if (!respID.ok) {
        throw new Error('failed fetching container id');
      }
      const { id } = await respID.json();
      console.debug(`set containerID ${id}`);

      const respCInfo = await fetch(`/api/dojo/clouseau/container/${id}`);
      const cInfo = await respCInfo.json();
      console.debug(`set container Info ${JSON.stringify(cInfo)}`);
      updateContainerInfo((prevInfo) => ({ ...prevInfo, ...cInfo }));
    } catch (err) {
      console.error(err);
    }
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

export const ModelInfoContext = createContext({});
export const ModelInfoUpdateContext = createContext({});
export const useModelInfoContext = () => useContext(ModelInfoContext);
export const useModelInfoUpdateContext = () => useContext(ModelInfoUpdateContext);
export const ModelInfoContextProvider = ({ model, children }) => {
  const [modelInfo, updateModelInfo] = useState(() => model);
  return (
    <ModelInfoContext.Provider value={modelInfo}>
      <ModelInfoUpdateContext.Provider value={{ updateModelInfo }}>
        { children }
      </ModelInfoUpdateContext.Provider>
    </ModelInfoContext.Provider>
  );
};
