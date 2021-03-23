import React, {
  useEffect, useState, useRef
} from 'react';

import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import ListItemText from '@material-ui/core/ListItemText';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import WarningIcon from '@material-ui/icons/Warning';

import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';

import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import { useHistoryContext, useHistoryUpdateContext, useSocketIOClient } from './context';

export const HiddenWS = ({ setAlert, setAlertVisible, setWsConnected }) => {
  const ws = useRef(null);
  const { addHistoryItem } = useHistoryUpdateContext();

  useEffect(async () => {
    ws.current = new WebSocket(`ws://${window.location.host}/websocket`);
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
    ws.current.onmessage = (evt) => {
      console.log(evt.data);
      const data = JSON.parse(evt.data);
      if (data.type === 'message') {
        const historyItem = data.payload;
        addHistoryItem({ text: `${historyItem}` });
      }
    };

    return () => {
      console.log('websocket closed');
      ws.current.close();
    };
  }, []);

  return (<> </>);
};

export const History = ({ setAlert, setAlertVisible }) => {
  const history = useHistoryContext();
  const { removeHistoryItem, markRunCommand } = useHistoryUpdateContext();

  const gridStyle = {
    textAlign: 'middle'
  };

  const toggleChecked = (checked, item) => {
    markRunCommand(item, checked);
  };

  return (
    <div style={{ margin: '2px', padding: '2px' }}>
      <div style={{ margin: '2px', padding: '2px' }}>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item xs={12} sm={12} style={gridStyle}>
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
          </Grid>
        </Grid>
      </div>
      <Divider style={{ margin: '2px' }} />
      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          size="small"
          aria-label="enhanced table"
        >
          <TableBody>
            {history.map((item) => (
              <TableRow
                hover
                tabIndex={-1}
                key={item.id}
              >
                <TableCell align="left" width="5%" style={{ padding: 0 }}>
                  <Switch checked={!!item.runCommand} onChange={(e, val) => toggleChecked(val, item)} />
                </TableCell>
                <TableCell align="left">
                  <div style={{
                    padding: '5px 0 5px 5px', fontFamily: 'monospace', backgroundColor: 'black', fontWeight: 'bold', color: 'white'
                  }}
                  >
                    {item.text}
                  </div>
                  {item.flag
                   && (
                   <div style={{
                     marginTop: '3px', display: 'flex', alignItems: 'center', flexWrap: 'wrap'
                   }}
                   >
                     <WarningIcon style={{ fontSize: '1.0rem', marginRight: '8px', color: 'yellow' }} />
                     <span>{item.message}</span>
                   </div>
                   )}
                </TableCell>
                <TableCell align="left" width="5%">
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      style={{ padding: '1px' }}
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
