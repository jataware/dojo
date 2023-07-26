import React from 'react';

import InfoIcon from '@mui/icons-material/Info';
import CheckIcon from '@mui/icons-material/Check';

import CircularProgress from '@mui/material/CircularProgress';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@mui/material/styles';

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
  error,
}) => {
  const displayIcon = () => {
    if (isComplete) {
      return <CheckIcon className={classes.check} fontSize="large" />;
    }

    if (loading) {
      return <CircularProgress thickness={4.5} size={25} />;
    }

    if (error !== false) {
      return <InfoIcon className={classes.close} fontSize="large" />;
    }
  };

  // If no message is supplied from the backend, we default to true, so use a default message
  const tooltipText = error.length ? error : 'This data is not available for transformation';

  return (
    <Tooltip
      arrow
      placement="right"
      title={error ? tooltipText : ''}
    >
      <span style={{ position: 'relative' }}>
        <ListItem
          button
          disabled={loading || error !== false}
          onClick={onClick}
        >
          <ListItemIcon>
            <Icon
              fontSize="large"
              className={isComplete ? classes.complete : classes.incomplete}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: 'h6' }}
            className={isComplete ? classes.complete : classes.incomplete}
          >
            {title}
          </ListItemText>
          <ListItemIcon className={classes.listItemIcon}>
            {displayIcon()}
          </ListItemIcon>
        </ListItem>
      </span>
    </Tooltip>
  );
});

export default TransformationButton;
