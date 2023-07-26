import React from 'react';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/material/styles';

/**
 *
 * */
export const Navigation = withStyles(({ spacing }) => ({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: spacing(2)
  },
}))(({
  classes, handleNext, handleBack, label, disabled, disableNext, ...props
}) => (
  <div className={classes.buttonContainer}>
    <Button
      onClick={handleBack}
      disabled={disabled}
    >
      Back
    </Button>
    {handleNext && (
      <Button
        color="primary"
        variant="contained"
        disableElevation
        disabled={disabled || disableNext}
        onClick={() => { handleNext({ handleNext, ...props }); }}
      >
        {label || 'Next'}
      </Button>
    )}
  </div>
));
