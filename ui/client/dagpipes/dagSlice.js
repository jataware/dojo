import { createSlice } from '@reduxjs/toolkit';

/* eslint-disable no-param-reassign */
const initialState = {
  nodeCount: 0,
  edgeCount: 0,
  selectedNodeId: null,
  selectedNodeType: null,
  selectedNodeLabel: null,
  selectedNodeInput: null,
  edgeType: 'default',
  unsavedChanges: false,
  savedDatasets: [],
  geoResolutionColumn: null,
  timeResolutionColumn: null,
  // selectedFeatures keeps track of which features have been chosen in Load Nodes
  // to prevent duplicates
  selectedFeatures: [],
  // All of the below are not handling the react-flow step specifically
  modelerStep: 0,
  flowcastJobId: null,
  completedDatasetIds: null,
  fetchedMetadata: {},
};
export const dagSlice = createSlice({
  name: 'dag',
  initialState,
  reducers: {
    nextModelerStep: (state) => {
      state.modelerStep += 1;
    },
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
    },
    setSavedDatasets: (state, action) => {
      state.savedDatasets = action.payload;
    },
    setGeoResolutionColumn: (state, action) => {
      state.geoResolutionColumn = action.payload;
    },
    setTimeResolutionColumn: (state, action) => {
      state.timeResolutionColumn = action.payload;
    },
    addSelectedFeature: (state, action) => {
      state.selectedFeatures.push(action.payload);
    },
    removeSelectedFeature: (state, action) => {
      const filteredFeatures = state.selectedFeatures.filter((feature) => (
        feature !== action.payload
      ));
      state.selectedFeatures = filteredFeatures;
    },
    setFlowcastJobId: (state, action) => {
      state.flowcastJobId = action.payload;
    },
    setCompletedDatasetIds: (state, action) => {
      state.completedDatasetIds = action.payload;
    },
    setFetchedMetadata: (state, action) => {
      const { datasetId, metadata } = action.payload;
      state.fetchedMetadata[datasetId] = metadata;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  nextModelerStep,
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
  setSavedChanges,
  setSavedDatasets,
  setGeoResolutionColumn,
  setTimeResolutionColumn,
  addSelectedFeature,
  removeSelectedFeature,
  setFlowcastJobId,
  setCompletedDatasetIds,
  setFetchedMetadata,
} = dagSlice.actions;

export default dagSlice.reducer;
