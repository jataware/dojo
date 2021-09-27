import React from 'react';

import Card from '@material-ui/core/Card';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Typography from '@material-ui/core/Typography';

import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: [[theme.spacing(1), theme.spacing(2), '10px']],
  },
  nextIcon: {
    color: 'yellow',
    marginRight: '4px',
    verticalAlign: '-.3em',
  },
}));

const DirectiveBox = ({ command, summaryPage, handleClick }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Card
      className={classes.card}
      style={{
        backgroundColor: summaryPage ? theme.palette.grey[400] : 'rgba(68, 93, 110, .5)',
        color: summaryPage ? theme.palette.text.secondary : '#fff',
      }}
    >
      <span>
        {!summaryPage && <Typography variant="subtitle1">Model Execution Directive:</Typography>}
        <NavigateNextIcon className={classes.nextIcon} />
        <Typography variant="subtitle1" component="span">
          {command?.command}
        </Typography>
      </span>
      { summaryPage && (
        <IconButton
          component="span"
          onClick={() => handleClick()}
        >
          <EditIcon />
        </IconButton>
      )}
    </Card>
  );
};

export default DirectiveBox;
