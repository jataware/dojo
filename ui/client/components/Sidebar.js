import React, { Fragment } from 'react';

import { Link } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import ArticleIcon from '@mui/icons-material/Article';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ComputerIcon from '@mui/icons-material/Computer';
import HomeIcon from '@mui/icons-material/Home';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { BlackTooltip } from './uiComponents/BlackTooltip';
import { ContrastIconButton, ContrastListItemButton } from './uiComponents/ContrastButton';

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
      <BlackTooltip disableInteractive title="Close navigation panel">
        <ContrastIconButton onClick={handleDrawerClose} sx={{ color: 'black' }}>
          <ChevronLeftIcon />
        </ContrastIconButton>
      </BlackTooltip>
    </Toolbar>
    <Divider sx={{ paddingTop: '1px' }} />
    <List sx={{ width: '100%' }}>
      {routes.map((route, i) => (
        <Fragment key={route.path}>
          <ListItem disablePadding>
            <ContrastListItemButton
              component={Link}
              to={route.path}
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
);

export default Sidebar;
