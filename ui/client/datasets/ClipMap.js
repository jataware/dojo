import React, { useEffect } from 'react';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { useLeafletContext } from '@react-leaflet/core';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
} from 'react-leaflet';

const Geoman = () => {
  const context = useLeafletContext();

  useEffect(() => {
    const leafletContainer = context.layerContainer || context.map;

    if (leafletContainer) {
      leafletContainer.pm.addControls({
        position: 'topleft',
        drawCircle: false,
      });
    }
  }, [context]);

  return null;
};

export default withStyles((theme) => ({
}))(({}) => {

  return (
    <div>
      <Typography align="center" variant="h5">Clip Map Data</Typography>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={1}
        scrollWheelZoom={false}
        style={{ height: 340, margin: '0 auto' }}
      >
        <Geoman />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
});
