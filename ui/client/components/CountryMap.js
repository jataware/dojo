import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios';

import 'leaflet/dist/leaflet.css';

import {
  GeoJSON,
  LayersControl,
  MapContainer
} from 'react-leaflet';

import GeographyListModal from './GeographyListModal';

const useStyles = makeStyles(() => ({
  myLeaflet: {
    backgroundColor: '#a3ceff',
  },

}));

function IndicatorCountryMap({ indicator }) {
  const indicatorCountriesSet = new Set(indicator?.geography?.country);
  const mapStyle = {
    fillColor: 'white',
    weight: 1,
    color: 'black',
    fillOpacity: 1,
  };

  const onEachCountry = (country, layer) => {
    const name = country.properties.ADMIN;
    layer.bindPopup(`${name}`);
    if (indicatorCountriesSet.has(name)) {
      layer.options.fillColor = 'green';   // eslint-disable-line
    }
  };

  const [countries, setCountries] = useState([]);
  useEffect(() => {
    axios.get('/assets/countries_borders.json')
      .then((countryBorderData) => { setCountries([...countryBorderData.data.features]); });
  }, []);
  const classes = useStyles();
  return (
    <div>
      {countries.length < 1
        ? <>Loading map ...</>
        : (
          <MapContainer
            className={classes.myLeaflet}
            center={[51.505, -0.09]}
            zoom={1}
            scrollWheelZoom={false}
            style={{ height: 380, margin: '0 auto' }}
          >
            <LayersControl.Overlay name="CountryList">
              <GeographyListModal geography={indicator?.geography} />
            </LayersControl.Overlay>

            <GeoJSON onEachFeature={onEachCountry} style={mapStyle} data={countries} />

          </MapContainer>
        )}
    </div>
  );
}

export default IndicatorCountryMap;
