import React, { memo, useEffect, useState } from 'react';
import {
  Handle, Position
} from 'reactflow';

import capitalize from 'lodash/capitalize';

import TextField from '@mui/material/TextField';

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
    // matches: single integer or slice, or a comma separated list of integers and/or slices
    const regex = /^(-?\d+|(-?\d+:-?\d+))(,(-?\d+|(-?\d+:-?\d+)))*(,)?$/;
    if (regex.test(strippedInput) || !strippedInput.length) {
      setValidIndexInput(true);
    } else {
      setValidIndexInput(false);
    }
  };

  // Use the custom debounced effect hook
  useDebouncedEffect(() => validateIndex(input[nodeIndex].index), 1000);

  const handleFieldChange = (event) => {
    onChange(id, event, nodeIndex);
  };

  return (
    <>
      <div style={{ margin: '16px' }}>
        <ModelerSelect
          value={input[nodeIndex].operation}
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
          value={input[nodeIndex].index}
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
  return (
    <div>
      <NodeBase title={NodeTitles.SELECT_SLICE} />
      <Handle
        type="target"
        position={Position.Top}
        id={handleId}
        style={topHandle}
      />
      <Form onChange={data.onChange} id={id} input={data.input} nodeIndex={0} />
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
