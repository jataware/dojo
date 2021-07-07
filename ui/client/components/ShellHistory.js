import React, {
  useEffect,
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

import { makeStyles } from '@material-ui/core/styles';

import {
  useContainerInfoContext,
  useHistoryContext,
  useHistoryUpdateContext,
  useWebSocketUpdateContext,
} from '../context';

export const ContainerWebSocket = ({
  workerNode,
  setDialogOpen, setDialogContents, setEditorContents, openEditor,
  setIsShorthandOpen, setIsShorthandSaving, setShorthandContents, setShorthandMode,
  setSpacetagUrl, setIsSpacetagOpen, setSpacetagFile
}) => {
  const { register, unregister } = useWebSocketUpdateContext();
  const { fetchHistory } = useHistoryUpdateContext();
  const containerInfo = useContainerInfoContext();

  const onMessage = (/* data */) => {
    fetchHistory(containerInfo.id);
    // const { command, cwd } = JSON.parse(data);

    // addHistoryItem({ text: command, cwd });
    // fetch(`/api/clouseau/container/store/${containerInfo.id}/history`, {
    //   method: 'PUT',
    //   body: JSON.stringify({ text: command, cwd })
    // });

    // TODO: container diffs have been disabled
    //
    // fetch(`/api/clouseau/container/diffs/${containerInfo.id}`).then(
    //   (resp) => {
    //     if (resp.ok) {
    //       resp.json().then((diffs) => {
    //         console.debug(`%c${cwd}  ${command}`, 'background: #fff; color: #000');
    //         const add = diffs.add.map((o) => `+ ${o.Path}`);
    //         const rm = diffs.rm.map((o) => `- ${o.Path}`);
    //         const diff = [...add, ...rm].join('\n');
    //         console.debug(diff);
    //       });
    //     }
    //   }
    // );
  };

  const storeFileRequest = async (info) => {
    const rsp = await fetch('/api/dojo/clouseau/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(info)
    });

    if (!rsp.ok) {
      throw new Error(`Failed to send file info ${rsp.status}`);
    }

    return rsp.json();
  };

  const onPrompt = (data) => {
    const { command, cwd } = JSON.parse(data);
    setDialogContents({ command, cwd });
    setDialogOpen(true);
  };

  const onBlocked = async (data) => {
    const { command, cwd } = JSON.parse(data);
    const s = command.trim();
    if (s.startsWith('edit ')) {
      const p = `${s.substring(5)}`;
      const f = (p.startsWith('/')) ? p : `${cwd}/${p}`;
      const rsp = await fetch(`/api/clouseau/container/${workerNode}/ops/cat?path=${f}`);
      if (rsp.ok) {
        setEditorContents({ text: await rsp.text(), file: f });
        openEditor();
      }
    } else if (s.startsWith('config ')) {
      // get file path user specified
      const path = `${s.substring('config '.length)}`;
      const fullPath = (path.startsWith('/')) ? path : `${cwd}/${path}`;

      // load that file's contents
      const rsp = await fetch(`/api/clouseau/container/${workerNode}/ops/cat?path=${fullPath}`);
      if (rsp.ok) {
        const fileContent = await rsp.text();

        // listen for messages from shorthand iframe
        window.onmessage = function shorthandOnMessage(e) {
          let postMessageBody;
          try {
            postMessageBody = JSON.parse(e.data);
          } catch {
            return; // not a json event
          }

          // more info: https://github.com/jataware/shorthand/pull/13
          if (postMessageBody.type === 'editor_loaded') {
            // editor has loaded, send in the file contents
            setShorthandContents({
              editor_content: fileContent,
              content_id: fullPath,
            });
          }
          if (postMessageBody.type === 'params_saved') {
            // console.log("Params Saved :)")
            setIsShorthandOpen(false);
          }
          if (postMessageBody.type === 'params_not_saved') {
            // console.log("Params Not Saved :(")
            setIsShorthandOpen(true); // keep shorthand open
            setIsShorthandSaving(false); // stop the saving spinner
          }
        };

        setShorthandMode('config');
        setIsShorthandSaving(false);
        setIsShorthandOpen(true); // open the <FullScreenDialog>
      }
    } else if (s.startsWith('tag ')) {
      const p = `${s.substring(4)}`;
      const f = (p.startsWith('/')) ? p : `${cwd}/${p}`;

      const { id: reqid } = await storeFileRequest({
        model_id: containerInfo.model_id,
        file_path: f,
        request_path: `/container/${workerNode}/ops/cat?path=${f}`
      });

      setSpacetagFile(`${f}`);
      setSpacetagUrl(`/api/spacetag/byom?reqid=${reqid}`);
      setIsSpacetagOpen(true);
    }
  };

  useEffect(() => {
    if (containerInfo?.id) {
      register('term/message', onMessage);
      register('term/prompt', onPrompt);
      register('term/blocked', onBlocked);
    }

    return (() => {
      unregister('term/message', onMessage);
      unregister('term/prompt', onPrompt);
      unregister('term/blocked', onBlocked);
    });
  }, [containerInfo]);

  return (<> </>);
};

const useStyles = makeStyles(() => ({
  table: {
    borderCollapse: 'separate',
  },
  tableHead: {
    '& .MuiTableCell-stickyHeader': {
      top: 0,
      left: 0,
      zIndex: 2,
      position: 'sticky',
      background: 'rgb(39, 45, 51)'
    },
  },
  tableBody: {
    '& .MuiTableRow-root:hover': {
      background: 'rgba(255, 255, 255, 0.2)'
    },
    '& tr > td': {
      color: 'white',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      borderColor: 'rgba(255, 255, 255, .1)',
    },
  },
  iconButton: {
    padding: '1px',
    margin: 0,
    color: 'white'
  },
}));

export const ShellHistory = () => {
  const { historyContext } = useHistoryContext();
  const { fetchHistory, removeHistoryItem } = useHistoryUpdateContext();
  const containerInfo = useContainerInfoContext();
  const removeItem = (item) => {
    removeHistoryItem(containerInfo.id, item);
  };
  const classes = useStyles();
  const tableRef = React.createRef(null);

  useEffect(() => {
    if (containerInfo?.id) {
      fetchHistory(containerInfo.id);
    }
  }, [containerInfo]);

  useEffect(() => {
    if (tableRef.current.lastChild != null) {
      tableRef.current.lastChild.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historyContext]);

  return (
    <div style={{
      margin: '2px', padding: '2px 5px 0 5px', color: '#fff', backgroundColor: 'rgb(128, 128, 128, .25)', borderRadius: '5px'
    }}
    >
      <TableContainer style={{ height: '400px', overflow: 'auto' }}>
        <Table
          aria-labelledby="tableTitle"
          aria-label="enhanced table"
          className={classes.table}
          stickyHeader
        >
          <TableHead>
            <TableRow className={classes.tableHead}>
              <TableCell colSpan={2} style={{ border: 0, borderRadius: '5px' }}>
                <Typography
                  component="div"
                  style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.0',
                    padding: '5px 0 7px 10px',
                    color: '#fff',
                  }}
                >
                  Shell History
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody ref={tableRef} className={classes.tableBody}>
            {historyContext.map((item) => (
              <TableRow
                hover
                tabIndex={-1}
                key={item.idx}
                className={classes.tr}
                style={item.runCommand && { backgroundColor: '#445d6e' }}
              >
                <TableCell align="left">
                  <div style={{ paddingLeft: '2px' }}>
                    {item.command}
                  </div>
                </TableCell>
                <TableCell align="left" width="8%">
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      aria-label="delete"
                      className={classes.iconButton}
                      onClick={() => removeItem(item)}
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
