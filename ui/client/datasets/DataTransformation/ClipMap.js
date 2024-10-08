import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { makeStyles } from 'tss-react/mui';

import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import { useLeafletContext } from '@react-leaflet/core';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapContainer,
  Polygon,
  TileLayer,
} from 'react-leaflet';

import PreviewTransformation from './PreviewTransformation';
import { generateProcessGeoCovArgs } from './dataTransformationHelpers';

const Geoman = ({ setDrawings, mapBoundsLatLng, setDisableDrawerClose }) => {
  const context = useLeafletContext();

  useEffect(() => {
    const leafletContainer = context.layerContainer || context.map;

    const setNewDrawings = () => {
      // getGeomanLayers gets all layers, including those loaded in from previously saved state
      const drawingsCoords = leafletContainer.pm.getGeomanLayers()
        .map((drawing) => drawing._latlngs[0]);

      // just extract the lat/lng coords to save to the parent
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

      // every time we toggle draw mode
      leafletContainer.on('pm:globaldrawmodetoggled', ({ enabled }) => {
        if (enabled) {
          // disable closing the drawer, as if we close while in any of these states
          // we risk losing all the drawings
          setDisableDrawerClose(true);
        } else {
          setDisableDrawerClose(false);
        }
      });

      // every time we toggle edit mode
      leafletContainer.on('pm:globaleditmodetoggled', ({ enabled }) => {
        if (enabled) {
          setDisableDrawerClose(true);
        } else {
          // when we disable edit mode, get the new state of the drawings
          setNewDrawings();
          setDisableDrawerClose(false);
        }
      });

      // every time we toggle removal mode
      leafletContainer.on('pm:globalremovalmodetoggled', ({ enabled }) => {
        if (enabled) {
          setDisableDrawerClose(true);
        } else {
          setDisableDrawerClose(false);
        }
      });

      // every time a drawing is created
      leafletContainer.on('pm:create', () => {
        setNewDrawings();
      });

      // get rid of the default 'finish' and 'removeLastVertex' buttons on Polygon
      leafletContainer.pm.Toolbar.changeActionsOfControl('Polygon', ['cancel']);

      leafletContainer.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawMarker: false,
        drawCircleMarker: false,
        drawText: false,
        drawPolyline: false,
        cutPolygon: false,
        rotateMode: false,
        // editMode: false,
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
  }, [context, setDrawings, mapBoundsLatLng, setDisableDrawerClose]);

  return null;
};

const useStyles = makeStyles()((theme) => ({
  noMapData: {
    paddingTop: theme.spacing(14),
  },
  header: {
    paddingBottom: theme.spacing(2),
  },
  subtitleList: {
    width: '220px',
  },
  problem: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  saveButton: {
    minWidth: '120px',
  },
  underMapContent: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: `${theme.spacing(2)} ${theme.spacing(1)}`,
    gap: theme.spacing(2),
  },
}));

export default ({
  mapBounds,
  saveDrawings,
  savedDrawings,
  closeDrawer,
  disableDrawerClose,
  setDisableDrawerClose,
  datasetId,
  jobString,
  annotations,
  cleanupRef,
}) => {
  const { classes } = useStyles();
  const [drawings, setDrawings] = useState([]);
  const theme = useTheme();
  const [map, setMap] = useState(null);

  // use a ref for this so we don't recreate it on every render
  const mapBoundsLatLng = useRef(null);
  const [outerBounds, setOuterBounds] = useState(null);
  if (mapBounds && mapBoundsLatLng.current === null && mapBounds[0][0] !== undefined) {
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

      setOuterBounds([outerBoundsLatLngs, innerBoundsArray]);
    }
  }, [map, mapBounds]);

  const handleMapCreated = (leafletMap) => {
    // once the map shows up in the MapContainer's ref
    if (leafletMap) {
      // load it into our react state so we can manipulate it in the useEffect
      setMap(leafletMap);
    }
  };

  // pseudo-ref that will allow us to know when the node is available on the page
  // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const polygonCallbackRef = useCallback((node) => {
    if (node !== null) {
      // disable geoman for this layer so users can't edit the bounding box
      // eslint-disable-next-line no-param-reassign
      node.pm._layer.options.pmIgnore = true;
    }
  }, []);

  const createPreviewArgs = useCallback((argsAnnotations) => {
    // merge drawings and savedDrawings, in case the user previews drawings from previous open
    const args = generateProcessGeoCovArgs(argsAnnotations, [...drawings, ...savedDrawings]);
    args.preview_run = true;
    return args;
  }, [drawings, savedDrawings]);

  const onSaveClipsClick = () => {
    saveDrawings(drawings);
    closeDrawer();
  };

  return (
    <div>
      <Typography align="center" variant="h5" className={classes.header}>
        Select Geospatial Coverage
      </Typography>
      {mapBounds ? (
        <>
          <MapContainer
            center={[51.505, -0.09]}
            style={{
              height: 400,
              margin: '0 auto',
              border: `1px solid ${theme.palette.grey[400]}`,
              borderRadius: theme.shape.borderRadius,
            }}
            ref={handleMapCreated}
          >
            <Geoman
              setDrawings={setDrawings}
              mapBoundsLatLng={mapBoundsLatLng}
              setDisableDrawerClose={setDisableDrawerClose}
            />
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
            {savedDrawings.map((drawing) => (
              <Polygon key={drawing[0] + drawing[1]} positions={drawing} />
            ))}
            <TileLayer
              noWrap
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
          <div className={classes.underMapContent}>
            <Typography variant="subtitle2">
              Note: areas clipped outside of the bounding box will not capture data.
              <br />Tip: hold down alt to avoid snapping to existing points.
            </Typography>
            <Tooltip
              title={
                disableDrawerClose
                  ? 'Please finish or cancel your map changes before continuing' : ''
              }
            >
              <span>
                <Button
                  className={classes.saveButton}
                  variant="contained"
                  color="primary"
                  onClick={onSaveClipsClick}
                  disableElevation
                  disabled={disableDrawerClose}
                >
                  Save Clips
                </Button>
              </span>
            </Tooltip>
          </div>
          <PreviewTransformation
            datasetId={datasetId}
            jobString={jobString}
            annotations={annotations}
            cleanupRef={cleanupRef}
            createPreviewArgs={createPreviewArgs}
            disabled={!drawings.length && !savedDrawings.length}
          />
        </>
      ) : (
        <div className={classes.problem}>
          <Typography variant="subtitle1" align="center" className={classes.noMapData}>
            There was a problem loading the map data
          </Typography>
        </div>
      )}
    </div>
  );
};
