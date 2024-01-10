import React, { Fragment } from 'react';

import { Link, useLocation } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComputerIcon from '@mui/icons-material/Computer';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { ThemedTooltip } from './uiComponents/ThemedTooltip';
import { ContrastIconButton, ContrastListItemButton } from './uiComponents/ContrastButton';

export const drawerWidth = 240;

const routes = [
  {
    title: 'Home',
    path: '/',
    icon: (props) => <HomeIcon {...props} />,
  },
  {
    title: 'Datasets',
    path: '/datasets/intro',
    icon: (props) => <AssessmentIcon {...props} />,
    children: [
      { title: 'Register a Dataset', path: '/datasets/register' },
      { title: 'Data Modeling', path: '/data-modeling' },
      { title: 'View Datasets', path: '/datasets' },
    ],
  },
  {
    title: 'Models',
    path: '/models/intro',
    icon: (props) => <ComputerIcon {...props} />,
    children: [
      { title: 'Register a Model', path: '/model' },
      { title: 'View Models', path: '/models' },
      { title: 'Model Runs', path: '/runs' },
    ],
  },
  {
    title: 'Documents',
    path: '/documents/intro',
    icon: (props) => <ArticleIcon {...props} />,
    children: [
      { title: 'Upload Documents', path: '/documents/upload' },
      { title: 'Documents AI Assistant', path: '/ai-assistant' },
      { title: 'Search Documents', path: '/documents' },
    ]
  },
];

const Sidebar = ({ open, handleDrawerClose }) => {
  const location = useLocation();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Toolbar
        variant="dense"
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <ThemedTooltip disableInteractive title="Close navigation panel">
          <ContrastIconButton onClick={handleDrawerClose} sx={{ color: 'black' }}>
            <ChevronLeftIcon />
          </ContrastIconButton>
        </ThemedTooltip>
      </Toolbar>
      <Divider sx={{ paddingTop: '1px' }} />
      <List sx={{ width: '100%' }}>
        {routes.map((route, i) => (
          <Fragment key={route.path}>
            <ListItem disablePadding>
              <ContrastListItemButton
                component={Link}
                to={route.path}
                sx={{
                  backgroundColor: location.pathname === route.path ? 'grey.200' : '',
                }}
              >
                {route.icon({ color: 'inherit', sx: { marginRight: '30px' } })}
                <ListItemText>{route.title}</ListItemText>
              </ContrastListItemButton>
            </ListItem>
            <List>
              {route.children?.map((childRoute) => (
                <ListItem key={childRoute.path} disablePadding>
                  <ContrastListItemButton
                    sx={{
                      paddingLeft: 4,
                      backgroundColor: location.pathname === childRoute.path ? 'grey.200' : '',
                    }}
                    component={Link}
                    to={childRoute.path}
                  >
                    {childRoute.title}
                  </ContrastListItemButton>
                </ListItem>
              ))}
            </List>
            {i !== routes.length - 1 && <Divider />}
          </Fragment>
        ))}
      </List>
    </Drawer>
  )
};

export default Sidebar;
