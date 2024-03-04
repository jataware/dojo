import React, { useState } from 'react';

import axios from 'axios';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { useSelector } from 'react-redux';

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Stats from '../datasets/annotations/Stats';

const ModelerStats = () => {
  const { savedDatasets } = useSelector((state) => state.dag);
  // this state is split into two to make it easier to
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [currentMetadata, setCurrentMetadata] = useState({});

  const handleSelectChange = (event) => {
    const [feature, datasetId] = event.target.value.split('::');
    setSelectedFeature(feature);
    setSelectedDataset(datasetId);
    // TODO: load any fetched datasets into redux, by default look there first
    axios.get(`/api/dojo/indicators/${datasetId}/annotations`)
      .then((resp) => {
        setCurrentMetadata(resp.data.metadata);
      })
      .catch((err) => {
        // TODO: Show an error in the stats display
        console.log('There was an error fetching the annotations', err);
      });
  };

  React.useEffect(() => {
    console.log('this is selectedFeature', selectedFeature)
    console.log('this is currentMetadata', currentMetadata)
  }, [currentMetadata, selectedFeature])

  const statistics = get(currentMetadata, `column_statistics.${selectedFeature}` || {});
  const histogramData = {
    data: get(currentMetadata, `histograms.${selectedFeature}.values`),
    labels: get(currentMetadata, `histograms.${selectedFeature}.bins`, {}),
  };

  return (
    <div style={{ margin: '24px 0 24px' }}>
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
          statistics={statistics}
          histogramData={histogramData}
        />
      )}
    </div>
  );
};

export default ModelerStats;
