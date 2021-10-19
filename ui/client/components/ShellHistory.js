import React, {
  useEffect,
} from 'react';

import DeleteIcon from '@material-ui/icons/Delete';

import Button from '@material-ui/core/Button';
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

import { useDirective } from './SWRHooks';

import {
  useContainerInfoContext,
  useHistoryContext,
  useHistoryUpdateContext,
  useWebSocketUpdateContext,
} from '../context';

export const ContainerWebSocket = ({
  workerNode,
  setEditorContents, openEditor,
  setIsShorthandOpen, setShorthandContents, setShorthandMode,
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

  const storeAccessoryRequest = async (info) => {
    const rsp = await fetch('/api/dojo/dojo/accessories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(info)
    });

    if (!rsp.ok) {
      throw new Error(`Failed to send accessory info ${rsp.status}`);
    }

    return rsp;
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
        // pass them along to shorthand
        setShorthandContents({
          editor_content: fileContent,
          content_id: fullPath,
        });
        // set the mode to config rather than directive
        setShorthandMode('config');
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
    } else if (s.startsWith('accessory ')) {
      const p = `${s.substring(10)}`;
      const f = (p.startsWith('/')) ? p : `${cwd}/${p}`;

      await storeAccessoryRequest({
        model_id: containerInfo.model_id,
        path: f
      });
    }
  };

  useEffect(() => {
    if (containerInfo?.id) {
      register('term/message', onMessage);
      register('term/blocked', onBlocked);
    }

    return (() => {
      unregister('term/message', onMessage);
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

export const ShellHistory = ({
  container,
  setDirective,
  setIsShorthandOpen,
  setShorthandMode,
  setShorthandContents,
}) => {
  const { historyContext } = useHistoryContext();
  const {
    fetchHistory,
    removeHistoryItem,
  } = useHistoryUpdateContext();
  const containerInfo = useContainerInfoContext();
  const removeItem = (item) => removeHistoryItem(containerInfo.id, item);
  const classes = useStyles();
  const tableRef = React.createRef(null);

  const { directive } = useDirective(container?.model_id);

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

  const handleAnnotationClick = async (item) => {
    // toggle <ShorthandEditor> to open in <App>, which loads the iframe
    setIsShorthandOpen(true);
    // set mode to directive before we load in content
    // or we get [Object][Object] showing in the iframe before content loads
    setShorthandMode('directive');
    setShorthandContents({
      editor_content: item.command,
      content_id: item.command,
    });
    setDirective(directive);
  };

  const isDirective = (command) => {
    if (!directive) return false;

    return command === directive.command_raw;
  };

  const displayHistoryItems = () => {
    // keep track of whether we've already marked a run command
    let foundDirective = false;

    return historyContext.map((item) => {
      let directiveItem = false;
      let directiveDuplicate = false;
      // three options for the text, so control it here instead of a ternary
      let buttonText = 'Mark as directive';

      if (!foundDirective && isDirective(item.command)) {
        // only mark one item as the run command even if we have duplicates
        directiveItem = true;
        foundDirective = true;
        buttonText = 'Edit Directive';
      } else if (foundDirective && isDirective(item.command)) {
        // mark the duplicates as duplicates
        directiveDuplicate = true;
        buttonText = 'Directive (duplicate)';
      }

      return (
        <TableRow
          hover
          tabIndex={-1}
          key={item.idx}
          className={classes.tr}
          style={{
            backgroundColor: directiveItem || directiveDuplicate ? '#445d6e' : '',
            opacity: directiveDuplicate ? 0.5 : 1,
          }}
        >
          <TableCell align="left">
            <div style={{ paddingLeft: '2px' }}>
              {item.command}
            </div>
          </TableCell>
          <TableCell align="right">
            <Button
              color={directiveItem ? 'primary' : 'default'}
              data-test="terminalMarkDirectiveBtn"
              disabled={directiveDuplicate}
              disableElevation
              onClick={() => handleAnnotationClick(item)}
              size="small"
              style={{
                // use an off white color so the disabled duplicate text
                // is legible on the directive background
                color: directiveDuplicate ? '#B2B2B2' : '',
                margin: '4px 8px',
                width: '164px',
              }}
              variant="contained"
            >
              {buttonText}
            </Button>
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
      );
    });
  };

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
            {displayHistoryItems()}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
