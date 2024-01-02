import { createTheme, alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// This theme is created just to be passed into the theme below
// seems like a weird way to do it but this is how MUI v5 theming works
const theme = createTheme({
  palette: {
    grey: {
      main: grey[300],
      dark: grey[400]
    }
  }
});

export default createTheme(theme, {
  breakpoints: {
    values: {
      xl: 1920,
    },
  },
  palette: {
    // mode: 'dark',
    secondary: {
      main: '#8917b9',
      dark: '#601082',
      light: '#9e1ad5',
      constrastText: '#fff',
    },
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
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: 0
        },
      },
    },
    // match v4 body font size
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: '0.875rem',
          lineHeight: 1.43,
          letterSpacing: '0.01071em',
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'contained', color: 'grey' },
          style: {
            color: theme.palette.getContrastText(theme.palette.grey[300])
          }
        },
        {
          props: { variant: 'outlined', color: 'grey' },
          style: {
            color: theme.palette.text.primary,
            borderColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.23)'
                : 'rgba(255, 255, 255, 0.23)',
            '&.Mui-disabled': {
              border: `1px solid ${theme.palette.action.disabledBackground}`
            },
            '&:hover': {
              borderColor:
                theme.palette.mode === 'light'
                  ? 'rgba(0, 0, 0, 0.23)'
                  : 'rgba(255, 255, 255, 0.23)',
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        },
        {
          props: { color: 'grey', variant: 'text' },
          style: {
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: alpha(
                theme.palette.text.primary,
                theme.palette.action.hoverOpacity
              )
            }
          }
        }
      ]
    }
  },
});
