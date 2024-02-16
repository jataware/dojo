import React, { memo, useEffect, useState } from 'react';
import {
  Handle, Position
} from 'reactflow';

import capitalize from 'lodash/capitalize';

import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import ModelerSelect from '../ModelerSelect';

import NodeBase from './NodeBase';
import {
  topHandle, bottomHandle, NodeTitles, dimensions
} from '../constants';

const dimensionsWithLabels = dimensions.map((dim) => ({ label: capitalize(dim), value: dim }));

// Custom debounced effect hook
function useDebouncedEffect(effect, delay) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
  }, [effect, delay]);
}

// nodeIndex is the position of this form in the list of forms within the node
const Form = ({
  onChange, input, id, nodeIndex
}) => {
  const [validIndexInput, setValidIndexInput] = useState(true);

  const validateIndex = (indexInput) => {
    // remove all whitespace
    const strippedInput = indexInput.replace(/\s+/g, '');

    // matches an integer with an optional negative
    const integerPattern = '-?\\d+';
    // matches any of the following slice patterns: :1, 1:, 1:1
    const slicePattern = `(:${integerPattern}|${integerPattern}:|${integerPattern}:${integerPattern})`;
    // can be integers and/or slices separated by commas
    const regexPattern = `^(${integerPattern}|${slicePattern})(,(${integerPattern}|${slicePattern}))*(,)?$`;

    const regex = new RegExp(regexPattern);
    if (regex.test(strippedInput) || !strippedInput.length) {
      setValidIndexInput(true);
    } else {
      setValidIndexInput(false);
    }
  };

  // Use the custom debounced effect hook
  useDebouncedEffect(() => validateIndex(input[nodeIndex]?.index), 1000);

  const handleFieldChange = (event) => {
    onChange(id, event, nodeIndex);
  };

  return (
    <>
      <div style={{ margin: '16px' }}>
        <ModelerSelect
          value={input[nodeIndex]?.operation}
          label="Dimension"
          onChange={handleFieldChange}
          options={dimensionsWithLabels}
          name="dimension"
          emptyOption
        />
      </div>
      <div style={{ margin: '16px' }}>
        <TextField
          error={!validIndexInput}
          className="nodrag"
          label="Index"
          value={input[nodeIndex]?.index}
          name="index"
          onChange={handleFieldChange}
          helperText={
            !validIndexInput
            && 'Input must be an integer, a pair of colon-separated integers (1:5), or a list of integers and/or pairs separated by commas'
          }
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ marginBottom: 2, backgroundColor: 'grey.50' }}
        />
      </div>
    </>
  );
};

function CustomNode({ id, data, handleId }) {
  const handleAddForm = () => {
    // the current length of data.input.length (the forms) will match the index of the next entry
    data.onChange(id, 'addSelectSlice', data.input.length);
  };

  const handleRemoveForm = (index) => {
    data.onChange(id, 'removeSelectSlice', index);
  };

  return (
    <div>
      <NodeBase title={NodeTitles.SELECT_SLICE} />
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      {data.input.map((item, index) => (
        <React.Fragment key={item.key}>
          <Divider />
          <Form onChange={data.onChange} id={id} input={data.input} nodeIndex={index} />
          <IconButton onClick={() => handleRemoveForm(index)}>
            <RemoveCircleOutlineIcon />
          </IconButton>
        </React.Fragment>
      ))}
      {/* TODO: style button */}
      <IconButton onClick={handleAddForm}><AddCircleOutlineIcon /></IconButton>
      <Handle
        type="source"
        position={Position.Bottom}
        id={handleId}
        style={bottomHandle}
      />
    </div>
  );
}

export default memo(CustomNode);
