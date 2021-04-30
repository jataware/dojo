import React, {
  useEffect, useRef
} from 'react';

import DeleteIcon from '@material-ui/icons/Delete';

import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { useHistoryContext, useHistoryUpdateContext } from '../context';

import RunCommandBox from './RunCommandBox';

export const ContainerWebSocket = ({
  setAlert, setAlertVisible, setDialogOpen, setDialogContents, setEditorContents, openEditor
}) => {
  const ws = useRef(null);
  const { addHistoryItem } = useHistoryUpdateContext();

  useEffect(async () => {
    const url = `ws://${window.location.host}/websocket`;
    console.log(`connecting ${url}`);

    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log('ws opened');
    };
    ws.current.onerror = (evt) => {
      console.log(`ws error ${evt}`);
      setAlert({
        severity: 'error',
        message: `Websocket Error: ${evt}`
      });
      setAlertVisible(true);
    };
    ws.current.onclose = () => {
      console.log('ws closed');
      setAlert({
        severity: 'warning',
        message: 'Websocket closed'
      });

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
          const p = `${s.substring(5)}`;
          const f = (p.startsWith('/')) ? p : `${cwd}/${p}`;
          const rsp = await fetch(`/container/cat?path=${f}`);
          if (rsp.ok) {
            setEditorContents({ text: await rsp.text(), file: f });
            openEditor();
          }
        }
      }
    };
    return async () => {
      console.log('websocket closed');
      ws.current.onclose = null;

      ws.current.close();
    };
  }, []);

  return (<> </>);
};

export const ShellHistory = () => {
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
      <TableContainer style={{ height: '400px', overflow: 'auto' }}>
        <Table
          aria-labelledby="tableTitle"
          aria-label="enhanced table"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} style={{ backgroundColor: '#272d33' }}>
                <Typography
                  component="div"
                  style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.0',
                    padding: '10px',
                    color: '#fff'
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
                style={item.runCommand && { backgroundColor: '#445d6e' }}
              >
                <TableCell align="left">
                  {item.runCommand
                    ? <RunCommandBox text={item.text} />
                    : (
                      <div style={{
                        padding: '5px 0 5px 5px', fontFamily: 'monospace', fontWeight: 'bold'
                      }}
                      >
                        {item.text}
                      </div>
                    )}
                </TableCell>
                <TableCell align="left" width="5%">
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      aria-label="delete"
                      style={{ ...{ padding: '1px', margin: 0 }, ...(item.runCommand && { color: '#fff' }) }}
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
