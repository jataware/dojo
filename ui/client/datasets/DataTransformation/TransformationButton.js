import React from 'react';

import InfoIcon from '@material-ui/icons/Info';
import CheckIcon from '@material-ui/icons/Check';

import CircularProgress from '@material-ui/core/CircularProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';

const TransformationButton = withStyles(({ palette }) => ({
  complete: {
    color: palette.grey[500],
  },
  incomplete: {
    color: palette.text.primary,
  },
  check: {
    color: palette.success.light,
  },
  close: {
    color: palette.info.light,
  },
  disabled: {
    color: palette.text.disabled,
  },
  listItemIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
}))(({
  classes,
  isComplete,
  Icon,
  title,
  onClick,
  loading,
  failed,
}) => {
  const displayIcon = () => {
    if (isComplete) {
      return <CheckIcon className={classes.check} fontSize="large" />;
    }

    if (loading) {
      return <CircularProgress thickness={4.5} size={25} />;
    }

    // TODO: change name from failed to something else?
    if (failed) {
      return <InfoIcon className={classes.close} fontSize="large" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <ListItem button disabled={loading || failed}>
        <ListItemIcon>
          <Icon
            fontSize="large"
            className={isComplete ? classes.complete : classes.incomplete}
          />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ variant: 'h6' }}
          onClick={onClick}
          className={isComplete ? classes.complete : classes.incomplete}
        >
          {title}
        </ListItemText>
        <ListItemIcon className={classes.listItemIcon}>
          {displayIcon()}
        </ListItemIcon>
      </ListItem>

    </div>
  );
});

export default TransformationButton;
