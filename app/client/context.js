import React, {
  createContext,
  useContext,
  useState
} from 'react';

import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export const SocketIOClientContext = createContext();

export const useSocketIOClient = () => useContext(SocketIOClientContext);

export const SocketIOClientContextProvider = ({ children }) => {
  const [ioclient, updateIoClient] = useState(() => io()); // eslint-disable-line no-unused-vars

  return (
    <SocketIOClientContext.Provider value={ioclient}>
      { children }
    </SocketIOClientContext.Provider>
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

  function clearHistoryContext() {
    updateHistory([]);
  }

  function addHistoryItem(itm) {
    const item = itm;

    if (item.text.toLowerCase().includes('python')) {
      item.flag = true;
      item.flagType = 'python';
      item.message = 'Are you executing a model?';
    }
    updateHistory((prevHistory) => [...prevHistory, { ...item, id: uuidv4() }]);
  }

  function markRunCommand(item, enable) {
    updateHistory(history.map((x) => {
      if (enable && x.id === item.id) {
        x.runCommand = true;
      } else {
        delete x.runCommand;
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
        addHistoryItem, removeHistoryItem, clearHistoryContext, markRunCommand
      }}
      >
        { children }
      </HistoryUpdateContext.Provider>
    </HistoryContext.Provider>

  );
};
