import React, {
  useEffect, useState, useRef
} from 'react';

import DeleteIcon from '@material-ui/icons/Delete';
import ForwardIcon from '@material-ui/icons/Forward';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { useHistoryContext, useHistoryUpdateContext, useSocketIOClient } from './context';

export const ContainerWebSocket = ({
  setAlert, setAlertVisible, setWsConnected, setDialogOpen, setDialogContents, setEditorContents
}) => {
  const ws = useRef(null);
  const { addHistoryItem } = useHistoryUpdateContext();

  useEffect(async () => {
    const url = `ws://${window.location.host}/websocket`;
    console.log(`connecting ${url}`);

    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log('ws opened');
      setWsConnected(true);
      // setAlert({
      //   severity: 'success',
      //   message: 'Websocket connect'
      // });
      // setAlertVisible(true);
    };
    ws.current.onerror = (evt) => {
      console.log(`ws error ${evt}`);
      setAlert({
        severity: 'error',
        message: `Websocket Error: ${evt}`
      });
      setAlertVisible(true);
      setWsConnected(false);
    };
    ws.current.onclose = () => {
      console.log('ws closed');
      setAlert({
        severity: 'warning',
        message: 'Websocket closed'
      });
      setWsConnected(true);
      setAlertVisible(true);
    };
    ws.current.onmessage = async (evt) => {
      console.log(evt.data);
      const data = JSON.parse(evt.data);
      if (data.type === 'message') {
        const { command, cwd } = JSON.parse(data.payload);
        addHistoryItem({ text: command, cwd });
      }
      if (data.type === 'prompt') {
        const { command, cwd } = JSON.parse(data.payload);
        setDialogContents({ text: command, cwd });
        setDialogOpen(true);
      }
      if (data.type === 'blocked') {
        const { command, cwd } = JSON.parse(data.payload);
        const s = command.trim();
        if (s.startsWith('edit ')) {
          const f = `${cwd}/${s.substring(5)}`;
          const rsp = await fetch(`/container/cat?path=${f}`);
          if (rsp.ok) {
            setEditorContents({ text: await rsp.text(), file: f });
          }
        }
      }
    };
    return async () => {
      console.log('websocket closed');
      ws.current.close();
    };
  }, []);

  return (<> </>);
};

export const History = () => {
  const history = useHistoryContext();
  const { removeHistoryItem } = useHistoryUpdateContext();

  const tableRef = React.createRef(null);

  useEffect(() => {
    if (tableRef.current.lastChild != null) {
      tableRef.current.lastChild.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return (
    <div style={{ margin: '2px', padding: '2px' }}>
      <TableContainer style={{ height: 200, overflow: 'auto' }}>
        <Table
          aria-labelledby="tableTitle"
          size="small"
          aria-label="enhanced table"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={3}>
                <Typography
                  component="div"
                  style={{
                    fontSize: '1.0rem',
                    lineHeight: '1.0',
                    backgroundColor: 'black',
                    padding: '10px',
                    color: 'white'
                  }}
                >
                  Shell History
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody ref={tableRef}>
            {history.map((item) => (
              <TableRow
                hover
                tabIndex={-1}
                key={item.id}
              >
                <TableCell align="left" width="2%" style={{ padding: 0 }}>
                  {item.runCommand && (
                    <Tooltip title="Run" arrow>
                      <ForwardIcon fontSize="small" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="left">
                  <div style={{
                    padding: '5px 0 5px 5px', fontFamily: 'monospace', fontWeight: 'bold', color: 'white'
                  }}
                  >
                    {item.text}
                  </div>
                </TableCell>
                <TableCell align="left" width="5%">
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      style={{ padding: '1px', margin: 0 }}
                      onClick={() => removeHistoryItem(item)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export const FileSystemUpdates = () => {
  const ioclient = useSocketIOClient();
  const [fsItems, setFsItems] = useState(() => []);

  useEffect(() => {
    console.log('bind fs_change');
    ioclient.on('fs_change', (data) => {
      data.sort((a, b) => ((a.Path > b.Path) ? 1 : -1));
      console.log(`len: ${data.length}`);
      setFsItems(data);
    });

    return (() => {
      console.log('unbind fs_change');
      ioclient.off('fs_change');
    });
  }, []);

  return (
    <div className="filesystem">
      <List disablePadding>
        {fsItems.map((item) => (
          <ListItem key={item.Path} dense>
            <ListItemText primary={item.Path} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};
