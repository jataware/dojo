import React from 'react';

import InfoIcon from '@material-ui/icons/Info';
import CheckIcon from '@material-ui/icons/Check';

import CircularProgress from '@material-ui/core/CircularProgress';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
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
  required: {
    color: palette.warning.light,
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
  required,
  error,
}) => {
  const displayIcon = () => {
    if (isComplete) {
      return <CheckIcon className={classes.check} fontSize="large" />;
    }

    if (loading) {
      return <CircularProgress thickness={4.5} size={25} />;
    }

    if (required && !isComplete && !error) {
      return <InfoIcon className={classes.required} fontSize="large" />;
    }

    if (error !== false) {
      return <InfoIcon className={classes.close} fontSize="large" />;
    }
  };

  const displayTooltipText = () => {
    // don't show a tooltip if the job is still loading
    if (loading) return '';
    if (error && error.length) return error;
    // if it doesn't come with an error message, use this default
    if (error) return 'This data is not available for transformation';
    if (required && !isComplete && !error) {
      // if it's required and not complete
      return 'Please review this transformation before continuing';
    }
    return '';
  };

  return (
    <Tooltip
      arrow
      placement="right"
      title={displayTooltipText()}
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
