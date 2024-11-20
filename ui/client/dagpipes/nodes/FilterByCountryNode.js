import React, { memo } from 'react';
import {
  Handle, Position
} from 'reactflow';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import NodeBase from './NodeBase';
import {
  topHandle, bottomHandle, countries, NodeTitles
} from '../constants';

/**
 *
 **/
function Select({
  input, handleId, nodeId, onChange
}) {
  // local input value for the autocomplete - this never seems to actually change?
  // but is required to make it work
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = (newValue) => {
    onChange(nodeId, { target: { value: newValue } });
  };

  return (
    <div>
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <Autocomplete
        value={input}
        inputValue={inputValue}
        onChange={(event, newVal) => handleChange(newVal)}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        multiple
        options={countries}
        // adjustments to move the close icon on top of the open icon
        // so we have more space for the country chips side by side
        sx={{
          '& .MuiAutocomplete-endAdornment': {
            display: 'flex',
            flexDirection: 'column',
            top: !input.length ? 'calc(50% - 14px)' : 'calc(30% - 14px)',
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Countries"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ backgroundColor: 'grey.50', }}
          />
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={handleId}
        style={bottomHandle}
      />
    </div>
  );
}

// reduce by country => from re-gridded to country data
const CustomNode = ({ id, data }) => (
  <NodeBase title={NodeTitles.FILTER_BY_COUNTRY} previews={data.previews} logPreviews={data.logPreviews}>
    <Select
      nodeId={id}
      input={data.input}
      onChange={data.onChange}
    />
  </NodeBase>
);

export default memo(CustomNode);
