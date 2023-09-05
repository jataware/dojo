import React from 'react';
import Button from '@mui/material/Button';

/**
 *
 * */
export const Navigation = ({
  handleNext, handleBack, label, disabled, disableNext, ...props
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '16px',
    }}
  >
    <Button
      onClick={handleBack}
      disabled={disabled}
      color="grey"
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
);
