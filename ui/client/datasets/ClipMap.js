import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { withStyles, useTheme } from '@material-ui/core/styles';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { useLeafletContext } from '@react-leaflet/core';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapContainer,
  Polygon,
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
      // This handles stopping users from drawing outside the bounding box
      // though now that it is inverted (the bounding box is a hole in a world-shaped polygon)
      // the logic will need to be tweaked
      // when a drawing is started
      // leafletContainer.on('pm:drawstart', ({ workingLayer }) => {
      //   workingLayer.on('pm:vertexadded', ({ latlng }) => {
      //     // if it is outside the mapBounds box
      //     if (!mapBoundsLatLng.current.contains(latlng)) {
      //       // TODO: add snackbar warning of clicking outside box
      //       // disable drawing
      //       leafletContainer.pm.disableDraw();
      //     }
      //   });
      // });

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
        drawCircleMarker: false,
        drawText: false,
        drawPolyline: false,
        cutPolygon: false,
        rotateMode: false,
        editMode: false,
        dragMode: false,
      });

      leafletContainer.pm.setGlobalOptions({
        snapSegment: false,
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
  },
  subtitleList: {
    width: '220px',

  },
  mapLoading: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: theme.spacing(4),
  },
  saveButton: {
    position: 'absolute',
    bottom: theme.spacing(8),
    right: theme.spacing(4),
  },
}))(({
  mapBounds, classes, saveDrawings, savedDrawings, closeDrawer
}) => {
  const [drawings, setDrawings] = useState([]);
  const theme = useTheme();
  const [map, setMap] = useState(null);
  // use a ref for this so we don't recreate it on every render
  const mapBoundsLatLng = useRef(null);
  const [outerBounds, setOuterBounds] = useState(null);

  if (mapBoundsLatLng.current === null && mapBounds) {
    mapBoundsLatLng.current = L.latLngBounds(mapBounds);
  }

  useEffect(() => {
    if (map && mapBoundsLatLng.current) {
      // fit the map to the size of the bounds and lock it in place
      map.fitBounds(mapBoundsLatLng.current);
      // don't allow the map to be moved outside of its bounds
      // map.setMaxBounds(mapBoundsLatLng.current);
      // get the zoom level, and limit the zoom out to that level
      // const currentZoom = map.getZoom();
      // map.setMinZoom(currentZoom);
      const bounds = new L.LatLngBounds([-90, -360], [90, 360]);
      // const bounds = map.getBounds();
      const outerBoundsLatLngs = [
        bounds.getSouthWest(),
        bounds.getNorthWest(),
        bounds.getNorthEast(),
        bounds.getSouthEast(),
      ];
      const innerBoundsArray = [
        mapBoundsLatLng.current.getSouthWest(),
        mapBoundsLatLng.current.getNorthWest(),
        mapBoundsLatLng.current.getNorthEast(),
        mapBoundsLatLng.current.getSouthEast(),
      ];

      console.log('these are bounds', bounds, outerBoundsLatLngs)
      setOuterBounds([outerBoundsLatLngs, innerBoundsArray]);
    }
  }, [map, mapBounds]);

  // pseudo-ref that will allow us to know when the node is available on the page
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const polygonCallbackRef = useCallback((node) => {
    if (node !== null) {
      // disable geoman for this layer so users can't edit the bounding box
      // eslint-disable-next-line no-param-reassign
      node.pm._layer.options.pmIgnore = true;
    }
  }, []);

  const onSaveClick = () => {
    saveDrawings(drawings);
    closeDrawer();
  };

  return (
    <div>
      <Typography align="center" variant="h5" className={classes.header}>
        Clip Map Data
      </Typography>
      {mapBounds ? (
        <div>
          <MapContainer
            center={[51.505, -0.09]}
            style={{
              height: 340,
              margin: '0 auto',
              border: `1px solid ${theme.palette.grey[400]}`,
              borderRadius: theme.shape.borderRadius,
            }}
            // don't allow much bounce outside of the map bounds
            // maxBoundsViscosity={1}
            whenCreated={setMap}
          >
            <Geoman setDrawings={setDrawings} mapBoundsLatLng={mapBoundsLatLng} />
            {outerBounds && (
              <Polygon
                positions={outerBounds}
                pathOptions={{
                  fillColor: theme.palette.grey[700],
                  fillOpacity: 0.5,
                  color: theme.palette.common.black,
                  stroke: true,
                  weight: 1,
                  opacity: 0.5
                }}
                ref={polygonCallbackRef}
              />
            )}
            <TileLayer
              noWrap
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
          <Typography variant="subtitle2" style={{ margin: theme.spacing(1) }}>
            Note: any areas clipped outside of the bounding box will not capture data
          </Typography>
        </div>
      ) : (
        <div className={classes.mapLoading}>
          <Typography variant="subtitle1" align="center" className={classes.noMapData}>
            Map Data Loading
          </Typography>
          <CircularProgress />
        </div>
      )}
      <List className={classes.subtitleList} disablePadding dense>
        {drawings.map((drawing, index) => (
          <ListItem key={`${drawing[0].lat}${drawing[0].lng}`}>
            <ListItemText>Drawing #{index + 1}</ListItemText>
            <ListItemIcon>
              <IconButton color="secondary"><DeleteIcon /></IconButton>
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={onSaveClick}
        disableElevation
        className={classes.saveButton}
      >
        Save Clips
      </Button>
    </div>
  );
});
