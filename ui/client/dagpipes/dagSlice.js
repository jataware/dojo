import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodeCount: 0,
  edgeCount: 0,
  selectedNodeId: null,
  selectedNodeType: null,
  selectedNodeLabel: null,
  selectedNodeInput: null,
  edgeType: 'default',
  unsavedChanges: false
};


export const dagSlice = createSlice({
  name: 'dag',
  initialState,
  reducers: {
    incrementNodeCount: (state) => {
      state.nodeCount += 1;
      state.unsavedChanges = true;
    },
    decrementNodeCount: (state) => {
      state.nodeCount -= 1;
      state.unsavedChanges = true;
    },
    setNodeCount: (state, action) => {
      state.nodeCount = action.payload;
    },
    incrementEdgeCount: (state) => {
      state.edgeCount += 1;
      state.unsavedChanges = true;
    },
    decrementEdgeCount: (state) => {
      state.edgeCount -= 1;
      state.unsavedChanges = true;
    },
    selectNode: (state, action) => {
      const { id, type } = action.payload;
      state.selectedNodeId = id;
      state.selectedNodeType = type;
    },
    unselectNodes: (state) => {
      state.selectedNodeId = null;
      state.selectedNodeType = null;
      state.selectedNodeLabel = null;
      state.selectedNodeInput = null;
    },
    setSelectedNodeLabel: (state, action) => {
      state.selectedNodeLabel = action.payload;
    },
    setSelectedNodeInput: (state, action) => {
      state.selectedNodeInput = action.payload;
    },
    setEdgeType: (state, action) => {
      state.edgeType = action.payload;
    },
    setSavedChanges: (state) => {
      state.unsavedChanges = false;
    }
  },
});


// Action creators are generated for each case reducer function
export const {
  incrementNodeCount,
  incrementEdgeCount,
  decrementNodeCount,
  decrementEdgeCount,
  selectNode,
  unselectNodes,
  setSelectedNodeInput,
  setSelectedNodeLabel,
  setEdgeType,
  setNodeCount,
  setSavedChanges
} = dagSlice.actions;

export default dagSlice.reducer;
