import React, { Fragment } from 'react';

import { Link } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComputerIcon from '@mui/icons-material/Computer';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const routes = [
  {
    title: 'Dojo Home',
    path: '/',
    icon: (props) => <HomeIcon {...props} />,
  },
  {
    title: 'Datasets',
    path: '/datasets',
    icon: (props) => <AssessmentIcon {...props} />,
    children: [
      { title: 'Register a Dataset', path: '/datasets/register' },
      { title: 'Data Modeling', path: '/data-modeling' },
    ],
  },
  {
    title: 'Models',
    path: '/models',
    icon: (props) => <ComputerIcon {...props} />,
    children: [
      { title: 'Register a Model', path: '/model' },
      { title: 'Model Runs', path: '/runs' },
    ],
  },
  {
    title: 'Documents',
    path: '/documents',
    icon: (props) => <ArticleIcon {...props} />,
    children: [
      { title: 'Upload Documents', path: '/documents/upload' },
      { title: 'Documents AI Assistant', path: '/ai-assistant' },
    ]
  },
];

const Sidebar = ({ open, handleDrawerClose }) => (
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
  >
    <Toolbar
      variant="dense"
      sx={{ display: 'flex', justifyContent: 'flex-end' }}
    >
      <Tooltip arrow title="Close navigation panel">
        <IconButton onClick={handleDrawerClose} sx={{ color: 'black' }}>
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
    <Divider sx={{ paddingTop: '1px' }} />
    <List sx={{ width: '100%' }}>
      {routes.map((route, i) => (
        <Fragment key={route.path}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to={route.path}
              sx={{
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'white',
                }
              }}
            >
              {route.icon({ color: 'inherit', sx: { marginRight: '30px' } })}
              <ListItemText>{route.title}</ListItemText>
            </ListItemButton>
          </ListItem>
          <List>
            {route.children?.map((childRoute) => (
              <ListItem key={childRoute.path} disablePadding>
                <ListItemButton
                  sx={{
                    paddingLeft: 4,
                    '&:hover': {
                      backgroundColor: 'black',
                      color: 'white',
                    }
                  }}
                  component={Link}
                  to={childRoute.path}
                >
                  {childRoute.title}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {i !== routes.length - 1 && <Divider />}
        </Fragment>
      ))}
    </List>
  </Drawer>
);

export default Sidebar;
