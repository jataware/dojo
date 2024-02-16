import React, { memo, useEffect, useState } from 'react';
import {
  Handle, Position
} from 'reactflow';

import capitalize from 'lodash/capitalize';

import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveIcon from '@mui/icons-material/Remove';

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
      <div style={{ margin: '16px 16px 0' }}>
        <TextField
          error={!validIndexInput}
          className="nodrag"
          label="Index"
          value={input[nodeIndex]?.index}
          name="index"
          onChange={handleFieldChange}
          helperText={
            !validIndexInput
            && 'Input must be an integer, a colon-separated range (e.g. 1:5, :5 or 5:) or a comma-separated list of integers and ranges.'
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
          <div
            style={{
              display: 'flex',
              justifyContent: index === data.input.length - 1 ? 'space-between' : 'flex-end',
              margin: '0 8px 8px',
            }}
          >
            {/* only show the add button if this is the final item */}
            {index === data.input.length - 1 && (
              <Tooltip arrow title="Add another slice">
                <IconButton color="primary" onClick={handleAddForm}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip
              arrow
              title={`Remove slice ${data.input.length === 1 ? '(disabled)' : ''}`}
            >
              <span>
                <IconButton
                  disabled={data.input.length === 1}
                  color="error"
                  onClick={() => handleRemoveForm(index)}
                  sx={{ }}
                >
                  <RemoveIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        </React.Fragment>
      ))}
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
