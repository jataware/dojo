import React, {
  useEffect
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
import {
  useHistoryContext,
  useHistoryUpdateContext,
  useWebSocketUpdateContext,
} from '../context';

import RunCommandBox from './RunCommandBox';

export const ContainerWebSocket = ({
  setDialogOpen, setDialogContents, setEditorContents, openEditor
}) => {
  const { register, unregister } = useWebSocketUpdateContext();
  const { addHistoryItem } = useHistoryUpdateContext();

  const onMessage = (data) => {
    const { command, cwd } = JSON.parse(data);
    addHistoryItem({ text: command, cwd });
  };

  const onPrompt = (data) => {
    const { command, cwd } = JSON.parse(data);
    setDialogContents({ text: command, cwd });
    setDialogOpen(true);
  };

  const onBlocked = async (data) => {
    const { command, cwd } = JSON.parse(data);
    const s = command.trim();
    if (s.startsWith('edit ')) {
      const p = `${s.substring(5)}`;
      const f = (p.startsWith('/')) ? p : `${cwd}/${p}`;
      const rsp = await fetch(`/api/container/ops/cat?path=${f}`);
      if (rsp.ok) {
        setEditorContents({ text: await rsp.text(), file: f });
        openEditor();
      }
    }
  };

  useEffect(() => {
    register('term/message', onMessage);
    register('term/prompt', onPrompt);
    register('term/blocked', onBlocked);

    return (() => {
      unregister('term/message', onMessage);
      unregister('term/prompt', onPrompt);
      unregister('term/blocked', onBlocked);
    });
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
