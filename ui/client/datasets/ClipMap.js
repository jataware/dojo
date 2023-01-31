import React, { useEffect, useState } from 'react';

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

const Geoman = ({ setDrawings }) => {
  const context = useLeafletContext();

  useEffect(() => {
    const leafletContainer = context.layerContainer || context.map;

    const setNewDrawings = () => {
      // just extract the lat/lng coords
      const drawingsCoords = leafletContainer.pm.getGeomanDrawLayers()
        .map((drawing) => drawing._latlngs[0]);

      setDrawings(drawingsCoords);
    };

    if (leafletContainer) {
      // when a drawing is removed
      leafletContainer.on('pm:remove', () => {
        setNewDrawings();
      });

      // every time we leave drag mode
      leafletContainer.on('pm:globaldragmodetoggled', ({ enabled }) => {
        if (!enabled) setNewDrawings();
      });

      // every time we leave edit mode
      leafletContainer.on('pm:globaleditmodetoggled', ({ enabled }) => {
        if (!enabled) setNewDrawings();
      });

      // every time a drawing is created
      leafletContainer.on('pm:create', () => {
        setNewDrawings();
      });

      leafletContainer.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawMarker: false,
        drawRectangle: false,
        drawCircleMarker: false,
        drawText: false,
        drawPolyline: false,
        cutPolygon: false,
        rotateMode: false,
      });
    }
    // TODO: clean up leafletContainer event listeners?
    return () => {
      leafletContainer.pm.removeControls();
    };
  }, [context, setDrawings]);

  return null;
};

export default withStyles((theme) => ({
}))(({}) => {
  const [drawings, setDrawings] = useState([]);

  return (
    <div>
      <Typography align="center" variant="h5">Clip Map Data</Typography>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={1}
        scrollWheelZoom={false}
        style={{ height: 340, margin: '0 auto' }}
      >
        <Geoman setDrawings={setDrawings} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
      {drawings.map((drawing) => (
        <Typography variant="h6" key={`${drawing[0].lat}${drawing[0].lng}`}>
          Here is a drawing: {JSON.stringify(drawing)}
        </Typography>
      ))}
    </div>
  );
});
