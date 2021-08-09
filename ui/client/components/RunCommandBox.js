import React from 'react';

import ButtonBase from '@material-ui/core/ButtonBase';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Typography from '@material-ui/core/Typography';

const RunCommandBox = ({ command, summaryPage, handleClick }) => (
  <ButtonBase
    style={{
      alignItems: 'center',
      backgroundColor: 'rgba(68, 93, 110, .5)',
      borderRadius: '5px',
      color: '#fff',
      display: ((command?.command ?? '') === '' ? 'none' : 'block'),
      padding: '10px 5px',
      textAlign: 'left',
      width: '100%',
    }}
    component="button"
    onClick={() => handleClick()}
    disabled={!summaryPage}
  >
    {!summaryPage
      && <Typography variant="subtitle2">Model Directive:</Typography>}
    <NavigateNextIcon
      style={{
        color: 'yellow',
        verticalAlign: '-.3em',
        marginRight: '4px'
      }}
    />
    <Typography variant="subtitle2" component="span">
      {command?.command}
    </Typography>
  </ButtonBase>
);

export default RunCommandBox;
