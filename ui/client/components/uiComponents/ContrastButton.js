import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import { styled } from '@mui/material/styles';

const contrastHoverStyles = (theme) => ({
  '&:hover': {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
});

export const ContrastButton = styled(Button)(({ theme }) => ({
  ...contrastHoverStyles(theme),
}));

export const ContrastIconButton = styled(IconButton)(({ theme }) => ({
  ...contrastHoverStyles(theme),
}));

export const ContrastListItemButton = styled(ListItemButton)(({ theme }) => ({
  ...contrastHoverStyles(theme),
}));
