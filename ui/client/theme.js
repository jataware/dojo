import { createTheme, adaptV4Theme } from '@mui/material/styles';

export default createTheme(adaptV4Theme({
  palette: {
    // mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
    warning: {
      contrastText: '#fff',
      dark: '#e65100',
      light: '#ff9800',
      main: '#ed6c02',
    },
    background: {
      default: '#fff'
    },
  },
  body: {
    backgroundColor: '#fff'
  },
  overrides: {
    MuiTableCell: {
      root: {
        padding: 0
      }
    },
    // match v4 body font size
    body: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
  }
}));
