import React from 'react';

import { Link } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComputerIcon from '@mui/icons-material/Computer';
import HomeIcon from '@mui/icons-material/Home';

const routes = [
  {
    title: 'Dojo Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    title: 'Datasets',
    path: '/datasets',
    icon: <AssessmentIcon />,
    children: [
      { title: 'Register a Dataset', path: '/datasets/register' },
      { title: 'Data Modeling', path: '/data-modeling' },
    ],
  },
  {
    title: 'Models',
    path: '/models',
    icon: <ComputerIcon />,
    children: [
      { title: 'Register a Model', path: '/model' },
      { title: 'Model Runs', path: '/runs' },
    ],
  },
  {
    title: 'Documents',
    path: '/documents',
    icon: <ArticleIcon />,
    children: [
      { title: 'Upload Documents', path: '/documents/upload' },
      { title: 'Documents AI Assistant', path: '/ai-assistant' },
    ]
  },
];

const Sidebar = ({ open, onRouteClick }) => (
  <Drawer
    sx={{
      width: 240,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 240,
        boxSizing: 'border-box',
      },
    }}
    variant="persistent"
    anchor="left"
    open={open}
    // PaperProps={{
    //   variant: 'outlined',
    //   sx: { borderRight: '2px solid black' },

    // }}

  >
    {/* Empty toolbar to create space for the actual toolbar */}
    <Toolbar />
    <List sx={{ width: '100%' }}>
      {routes.map((route, i) => (
        <>
          <ListItem disablePadding>
            <ListItemButton
              key={route.path}
              component={Link}
              to={route.path}
              color="grey"
              onClick={onRouteClick}
            >
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText>{route.title}</ListItemText>
            </ListItemButton>
          </ListItem>
          <List>
            {route.children?.map((childRoute) => (
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ paddingLeft: 4 }}
                  key={childRoute.path}
                  component={Link}
                  to={childRoute.path}
                  color="grey"
                  onClick={onRouteClick}
                >
                  {childRoute.title}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {i !== routes.length - 1 && <Divider />}
        </>
      ))}
    </List>
  </Drawer>
);

export default Sidebar;
