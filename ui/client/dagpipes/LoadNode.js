import React, { memo, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
  Handle, Position
} from 'reactflow';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import InlineDocLink from '../components/uiComponents/InlineDocLink';
import NodeBase from './NodeBase';
import ModelerSelect from './ModelerSelect';
import {
  setGeoResolutionColumn,
  setTimeResolutionColumn,
  addSelectedFeature,
  removeSelectedFeature,
} from './dagSlice';
import {
  bottomHandle, aggregation_functions, NodeTitles
} from './constants';

const aggList = aggregation_functions.map((res) => ({ value: res, label: res }));

const AggregationLabel = ({ text }) => (
  <div>
    {text}
    <InlineDocLink link="data-modeling/aggregation-methods.html" title="aggregation function" />
  </div>
);

function SelectFeature({ input, nodeId, onChange }) {
  const {
    savedDatasets, geoResolutionColumn, timeResolutionColumn, selectedFeatures
  } = useSelector((state) => state.dag);
  const dispatch = useDispatch();

  const [geoSelected, setGeoSelected] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);
  const [savedSelectValue, setSavedSelectValue] = useState(null);

  const handleGeoChange = (event) => {
    setGeoSelected(event.target.checked);
    let columnUpdate = null;
    // only dispatch the saved value if it's checked
    if (event.target.checked) {
      columnUpdate = savedSelectValue;
    }
    // otherwise clear the value with null
    dispatch(setGeoResolutionColumn(columnUpdate));
  };

  const handleTimeChange = (event) => {
    setTimeSelected(event.target.checked);
    let columnUpdate = null;
    // only dispatch the saved value if it's checked
    if (event.target.checked) {
      columnUpdate = savedSelectValue;
    }
    // otherwise clear the value with null
    dispatch(setTimeResolutionColumn(columnUpdate));
  };

  const handleSelectChange = (event) => {
    if (savedSelectValue) {
      // if we've previously selected something, remove it from selectedFeatures
      dispatch(removeSelectedFeature(savedSelectValue));
    }
    // we clear the select with an empty string, don't save this
    if (event.target.value !== '') {
      // add our selection to the selectedFeatures redux state, so we can prevent
      // Load Nodes from being added
      dispatch(addSelectedFeature(event.target.value));
    }
    // capture the value of the select so we can send it along with our resolution checkbox
    setSavedSelectValue(event.target.value);
    onChange(nodeId, event);
  };

  // disable when there is no feature selected, or when geo/time is selected elsewhere
  // but keep enabled if it's in this node so it can be unchecked
  const geoResolutionDisabled = !savedSelectValue
    || (!geoSelected && Boolean(geoResolutionColumn));
  const timeResolutionSelected = !savedSelectValue
    || (!timeSelected && Boolean(timeResolutionColumn));

  return (
    <div>
      <ModelerSelect
        value={input.data}
        label="Data Source"
        onChange={handleSelectChange}
        name="data_source"
        emptyOption
      >
        {Object.keys(savedDatasets).map((datasetId) => (
          <optgroup key={datasetId} label={savedDatasets[datasetId].name}>
            {savedDatasets[datasetId].features.map((feature, itemIndex) => {
              const datasetFeature = `${feature}::${datasetId}`;
              const disabled = selectedFeatures.includes(datasetFeature);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <option key={`${datasetId}-${itemIndex}`} disabled={disabled} value={datasetFeature}>
                  {feature}
                </option>
              );
            })};
          </optgroup>
        ))}
      </ModelerSelect>
      <FormGroup sx={{ marginY: 1 }}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={geoSelected}
              onChange={handleGeoChange}
            />
          )}
          label="Select as Geo Resolution"
          slotProps={{ typography: { variant: 'caption' } }}
          disabled={geoResolutionDisabled}
        />
        <FormControlLabel
          control={(
            <Checkbox
              checked={timeSelected}
              onChange={handleTimeChange}
            />
          )}
          label="Select as Time Resolution"
          slotProps={{ typography: { variant: 'caption' } }}
          disabled={timeResolutionSelected}
        />
      </FormGroup>

      <div style={{ marginBottom: '16px' }}>
        <ModelerSelect
          value={input.geo_aggregation_function}
          label={<AggregationLabel text="Geo Aggregation Function" />}
          onChange={(event) => onChange(nodeId, event)}
          options={aggList}
          name="geo_aggregation_function"
          emptyOption
        />
      </div>
      <ModelerSelect
        value={input.time_aggregation_function}
        label={<AggregationLabel text="Time Aggregation Function" />}
        onChange={(event) => onChange(nodeId, event)}
        options={aggList}
        name="time_aggregation_function"
        emptyOption
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={bottomHandle}
      />
    </div>
  );
}

const CustomNode = ({ id, data }) => (
  <NodeBase title={NodeTitles.LOAD}>
    <SelectFeature
      nodeId={id}
      onChange={data.onChange}
      input={data.input}
    />
  </NodeBase>
);

export default memo(CustomNode);
