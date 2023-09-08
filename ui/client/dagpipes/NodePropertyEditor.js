
import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
  setSelectedNodeLabel,
  setSelectedNodeInput,
} from './dagSlice';

import './updatenode.scss';

export default (props) => {

  const {
    selectedNodeLabel, selectedNodeInput,
    selectedNodeType
  } = useSelector((state) => state.dag);

  const dispatch = useDispatch();

  // style={{display: 'none'}}
  return (
    <div className="updatenode__controls">

      {/* <label> */}
      {/*   Label: */}
      {/* </label> */}
      {/* <input */}
      {/*   value={selectedNodeLabel} */}
      {/*   onChange={(evt) => dispatch(setSelectedNodeLabel(evt.target.value))} */}
      {/* /> */}

      {selectedNodeType === 'input' && (
        <>
          <label className="updatenode__input">
            Input:
          </label>
          <input
            value={selectedNodeInput}
            onChange={(evt) => dispatch(setSelectedNodeInput(evt.target.value))}
          />
        </>
      )}

      {selectedNodeType === 'output' && (
        <>
          <label className="updatenode__output">
            Output:
          </label>
          <input />
        </>
      )}

    </div>
  );
}
