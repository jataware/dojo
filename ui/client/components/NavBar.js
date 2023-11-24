import React, { useContext, useState } from 'react';

import { Link } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import GitHubIcon from '@mui/icons-material/GitHub';
// TODO: maybe use this instead of Library icon for docs link?
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import MenuIcon from '@mui/icons-material/Menu';

import { makeStyles } from 'tss-react/mui';

import { ThemeContext } from './ThemeContextProvider';

import Sidebar from './Sidebar';

const useStyles = makeStyles()((theme) => ({
  appBarRoot: {
    backgroundColor: '#06B8EF',
    backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
  },
  toolbar: {
    padding: `0 ${theme.spacing(5)}`,
    gap: theme.spacing(3),
  },
  dojoIcon: {
    height: '40px',
    width: '40px',
    marginRight: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
}));

const NavBar = () => {
  const { classes } = useStyles();
  const { showNavBar, fixedNavBar } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);

  if (!showNavBar) {
    return null;
  }

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    if (open) setOpen(false);
  };

  return (
    // handles closing the sidebar drawer when clicking anywhere but the drawer or appbar
    <ClickAwayListener onClickAway={handleDrawerClose}>
      <div>
        <AppBar
          open={open}
          position={fixedNavBar ? 'fixed' : 'relative'}
          elevation={0}
          classes={{ root: classes.appBarRoot }}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar variant="dense" disableGutters className={classes.toolbar}>
            <IconButton
              onClick={handleToggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title="Dojo home" arrow>
              <IconButton
                component={Link}
                to="/"
                size="small"
              >
                <img
                  src="/assets/Dojo_Logo_black.svg"
                  alt="Dojo Logo"
                  className={classes.dojoIcon}
                />
              </IconButton>
            </Tooltip>
            <span className={classes.spacer} />
            <Tooltip title="View Dojo Docs (opens new tab)" arrow>
              <IconButton
                href="https://www.dojo-modeling.com"
                target="_blank"
                rel="noopener"
                sx={{ color: 'white' }}
              >
                <AutoStoriesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Dojo on Github (opens new tab)" arrow>
              <IconButton
                href="https://github.com/jataware/dojo"
                target="_blank"
                rel="noopener"
                sx={{ color: 'white' }}
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Sidebar open={open} onRouteClick={handleDrawerClose} />
        {/*TODO: add toolbar, remove 56px padding from all containers/top level page components*/}
        {/*<Toolbar />*/}
      </div>
    </ClickAwayListener>
  );
};

export default NavBar;






////// ----> entire app slides right when drawer opens

// import * as React from 'react';

// import { Link } from 'react-router-dom';

// import Tooltip from '@mui/material/Tooltip';
// import { styled, useTheme } from '@mui/material/styles';
// import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import CssBaseline from '@mui/material/CssBaseline';
// import MuiAppBar from '@mui/material/AppBar';
// import Toolbar from '@mui/material/Toolbar';
// import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';
// import GitHubIcon from '@mui/icons-material/GitHub';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

// import { makeStyles } from 'tss-react/mui';

// const drawerWidth = 240;

// const useStyles = makeStyles()((theme) => ({
//   appBarRoot: {
//     backgroundColor: '#06B8EF',
//     backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
//   },
//   toolbar: {
//     padding: `0 ${theme.spacing(5)}`,
//     gap: theme.spacing(3),
//   },
//   dojoIcon: {
//     height: '40px',
//     width: '40px',
//     marginRight: theme.spacing(1),
//   },
// }));

// const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
//   ({ theme, open }) => ({
//     flexGrow: 1,
//     // padding: theme.spacing(3),
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//     marginLeft: `-${drawerWidth}px`,
//     ...(open && {
//       transition: theme.transitions.create('margin', {
//         easing: theme.transitions.easing.easeOut,
//         duration: theme.transitions.duration.enteringScreen,
//       }),
//       marginLeft: 0,
//     }),
//   }),
// );

// const AppBar = styled(MuiAppBar, {
//   shouldForwardProp: (prop) => prop !== 'open',
// })(({ theme, open }) => ({
//   backgroundColor: '#06B8EF',
//   backgroundImage: 'linear-gradient(to right, #06B8EF, #A11BDA)',
//   transition: theme.transitions.create(['margin', 'width'], {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   ...(open && {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: `${drawerWidth}px`,
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   }),
// }));

// const DrawerHeader = styled('div')(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   padding: theme.spacing(0, 1),
//   // necessary for content to be below app bar
//   ...theme.mixins.toolbar,
//   justifyContent: 'flex-end',
// }));

// export default function PersistentDrawerLeft({ children }) {
//   const theme = useTheme();
//   const [open, setOpen] = React.useState(false);
//   const { classes } = useStyles();

//   const handleDrawerOpen = () => {
//     setOpen(!open);
//   };

//   const handleDrawerClose = () => {
//     setOpen(false);
//   };

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />
//       <AppBar position="fixed" elevation={0} open={open}>
//         <Toolbar sx={{ justifyContent: 'space-between' }}>
//           <span>
//             <IconButton
//               aria-label="open drawer"
//               onClick={handleDrawerOpen}
//               edge="start"
//               sx={{ mr: 2  }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Tooltip title="Dojo home" arrow>
//               <IconButton
//                 component={Link}
//                 to="/"
//                 size="small"
//               >
//                 <img
//                   src="/assets/Dojo_Logo_black.svg"
//                   alt="Dojo Logo"
//                   className={classes.dojoIcon}
//                 />
//               </IconButton>
//             </Tooltip>
//           </span>
//           <span>
//             <Tooltip title="View Dojo Docs (opens new tab)" arrow>
//               <IconButton
//                 href="https://www.dojo-modeling.com"
//                 target="_blank"
//                 rel="noopener"
//                 sx={{ color: 'white' }}
//               >
//                 <LibraryBooksIcon />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="View Dojo on Github (opens new tab)" arrow>
//               <IconButton
//                 href="https://github.com/jataware/dojo"
//                 target="_blank"
//                 rel="noopener"
//                 sx={{ color: 'white' }}
//               >
//                 <GitHubIcon />
//               </IconButton>
//             </Tooltip>
//           </span>
//         </Toolbar>
//       </AppBar>
//       <Drawer
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: drawerWidth,
//             boxSizing: 'border-box',
//           },
//         }}
//         variant="persistent"
//         anchor="left"
//         open={open}
//       >
//         <DrawerHeader>
// {/*          <IconButton onClick={handleDrawerClose}>
//             {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//           </IconButton>*/}
//         </DrawerHeader>
//         <Divider />
//         <List>
//           {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//             <ListItem key={text} disablePadding>
//               <ListItemButton>
//                 <ListItemIcon>
//                   {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//                 </ListItemIcon>
//                 <ListItemText primary={text} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//         <Divider />
//         <List>
//           {['All mail', 'Trash', 'Spam'].map((text, index) => (
//             <ListItem key={text} disablePadding>
//               <ListItemButton>
//                 <ListItemIcon>
//                   {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//                 </ListItemIcon>
//                 <ListItemText primary={text} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Drawer>
//       <Main open={open}>
//         <DrawerHeader />
//         {children}
//       </Main>
//     </Box>
//   );
// }
