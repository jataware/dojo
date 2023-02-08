import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles, useTheme } from '@material-ui/core/styles';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { useLeafletContext } from '@react-leaflet/core';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapContainer,
  Rectangle,
  TileLayer,
} from 'react-leaflet';

const Geoman = ({ setDrawings, mapBoundsLatLng }) => {
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
      // when a drawing is started
      leafletContainer.on('pm:drawstart', ({ workingLayer }) => {
        workingLayer.on('pm:vertexadded', ({ latlng }) => {
          // if it is outside the mapBounds box
          if (!mapBoundsLatLng.current.contains(latlng)) {
            // TODO: add snackbar warning of clicking outside box
            // disable drawing
            leafletContainer.pm.disableDraw();
          }
        });
      });

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
        editMode: false,
        dragMode: false,
      });
    }
    // TODO: clean up leafletContainer event listeners?
    return () => {
      leafletContainer.pm.removeControls();
    };
  }, [context, setDrawings, mapBoundsLatLng]);

  return null;
};

export default withStyles((theme) => ({
  noMapData: {
    paddingTop: theme.spacing(14),
  },
  header: {
    paddingBottom: theme.spacing(2),
  }
}))(({ mapBounds, classes, saveDrawings }) => {
  const [drawings, setDrawings] = useState([]);
  const theme = useTheme();
  const [map, setMap] = useState(null);
  // use a ref for this so we don't recreate it on every render
  const mapBoundsLatLng = useRef(null);

  if (mapBoundsLatLng.current === null) {
    mapBoundsLatLng.current = L.latLngBounds(mapBounds);
  }

  useEffect(() => {
    if (map && mapBoundsLatLng.current) {
      // fit the map to the size of the bounds and lock it in place
      map.fitBounds(mapBoundsLatLng.current);
      map.setMaxBounds(mapBoundsLatLng.current);
      const currentZoom = map.getZoom();
      map.setMinZoom(currentZoom);
    }
  }, [map, mapBounds]);

  // pseudo-ref that will allow us to know when the node is available on the page
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const rectangleCallbackRef = useCallback((node) => {
    if (node !== null) {
      // disable geoman for this layer so users can't edit the bounding box
      // eslint-disable-next-line no-param-reassign
      node.pm._layer.options.pmIgnore = true;
    }
  }, []);

  const onSaveClick = () => {
    saveDrawings(drawings);
  };

  return (
    <div>
      <Typography align="center" variant="h5" className={classes.header}>
        Clip Map Data
      </Typography>
      {mapBounds ? (
        <MapContainer
          center={[51.505, -0.09]}
          style={{ height: 340, margin: '0 auto' }}
          maxBoundsViscosity={1}
          whenCreated={setMap}
        >
          <Geoman setDrawings={setDrawings} mapBoundsLatLng={mapBoundsLatLng} />
          <Rectangle
            bounds={mapBounds}
            ref={rectangleCallbackRef}
            pathOptions={{ color: theme.palette.success.main, opacity: 0.7 }}
          />
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      ) : (
        <Typography variant="subtitle1" align="center" className={classes.noMapData}>
          No Map Data Found
        </Typography>
      )}
      {drawings.map((drawing) => (
        <Typography variant="h6" key={`${drawing[0].lat}${drawing[0].lng}`}>
          Here is a drawing: {JSON.stringify(drawing)}
        </Typography>
      ))}
      <Button variant="contained" color="primary" onClick={onSaveClick}>
        Save Clips
      </Button>
    </div>
  );
});
