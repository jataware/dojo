import React from 'react';

import { Link } from 'react-router-dom';

import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';

const routes = [
  { title: 'Models', path: '/models' },
  { title: 'Datasets', path: '/datasets' },
  { title: 'Model Runs', path: '/runs' },
  { title: 'Documents', path: '/documents' },
  { title: 'Data Modeling', path: '/data-modeling' },
  { title: 'AI Assistant', path: '/ai-assistant' },
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
  >
    {/* Empty toolbar to create space for the actual toolbar */}
    <Toolbar />
    {routes.map((route) => (
      <Button
        key={route.path}
        component={Link}
        to={route.path}
        color="grey"
        onClick={onRouteClick}
      >
        {route.title}
      </Button>
    ))}
  </Drawer>
);

export default Sidebar;
