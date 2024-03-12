import React, { useState } from 'react';

import axios from 'axios';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { useDispatch, useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { setFetchedMetadata } from './dagSlice';

import Stats from '../datasets/annotations/Stats';

const ModelerStats = () => {
  const { fetchedMetadata, savedDatasets } = useSelector((state) => state.dag);
  const dispatch = useDispatch();
  // this state is split into two to make it easier to use just selectedFeature
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [currentMetadata, setCurrentMetadata] = useState({});

  const handleSelectChange = (event) => {
    const [feature, datasetId] = event.target.value.split('::');
    setSelectedFeature(feature);
    setSelectedDataset(datasetId);

    if (fetchedMetadata[datasetId]) {
      // if we've already fetched this dataset from the server and stored it to redux
      // don't fetch again, just get it from redux
      setCurrentMetadata(fetchedMetadata[datasetId]);
    } else {
      // otherwise fetch it from the server
      axios.get(`/api/dojo/indicators/${datasetId}/annotations`)
        .then((resp) => {
          // reduce the feature down to just { name: unit } for use in labeling
          const featureUnits = resp.data.annotations.feature.reduce((acc, feat) => {
            acc[feat.name] = feat.units;
            return acc;
          }, {});

          // strip out everything we don't need to store in redux for stats
          const {
            files, geotime_classify, transformations, ...statsMetadata
          } = resp.data.metadata;

          // combine the units and our pared down metadata
          const parsedMetadata = { featureUnits, ...statsMetadata };

          // set it as the current metadata
          setCurrentMetadata(parsedMetadata);
          // and add it to the redux store
          dispatch(setFetchedMetadata({ datasetId, metadata: parsedMetadata }));
        })
        .catch((err) => {
          // TODO: Show an error in the stats display
          console.log('There was an error fetching the annotations', err);
        });
    }
  };

  const statistics = get(currentMetadata, `column_statistics.${selectedFeature}` || {});
  const histogramData = {
    data: get(currentMetadata, `histograms.${selectedFeature}.values`),
    labels: get(currentMetadata, `histograms.${selectedFeature}.bins`, {}),
  };

  const currentUnits = get(currentMetadata, `featureUnits.${selectedFeature}`, {});

  // color matches input outline
  const border = '1px solid #c4c4c4';
  const width = '350px';

  return (
    <Box
      sx={{
        padding: 2,
        minWidth: width,
        maxWidth: width,
        borderLeft: border,
        borderRight: border,
      }}
    >
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel
          id="view-stats-label"
          shrink
        >
          View Stats for:
        </InputLabel>
        <Select
          notched
          fullWidth
          labelId="view-stats-label"
          size="small"
          label="View Stats for:"
          value={selectedFeature ? `${selectedFeature}::${selectedDataset}` : ''}
          onChange={handleSelectChange}
          native
        >
          {/* blank label so we don't have to have one selected by default */}
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <option value="" />
          {Object.keys(savedDatasets).map((datasetId) => (
            <optgroup key={datasetId} label={savedDatasets[datasetId].name}>
              {savedDatasets[datasetId].features.map((feature, itemIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <option key={itemIndex} value={`${feature}::${datasetId}`}>
                  {feature}
                </option>
              ))};
            </optgroup>
          ))}
        </Select>
      </FormControl>

      {(!isEmpty(currentMetadata) && selectedFeature) && (
        <Stats
          // pass down name and units together
          featureUnits={{ [selectedFeature]: currentUnits }}
          statistics={statistics}
          histogramData={histogramData}
          dense
        />
      )}
    </Box>
  );
};

export default ModelerStats;
