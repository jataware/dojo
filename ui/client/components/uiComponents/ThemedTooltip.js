import React from 'react';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

export const ThemedTooltip = styled(({ className, ...props }) => (
  <Tooltip arrow {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.custom.button.backgroundColor,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.custom.button.backgroundColor,
    color: theme.custom.button.color,
  }
}));
