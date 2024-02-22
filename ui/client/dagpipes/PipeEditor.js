import React, {
  useCallback, useRef, useState, useEffect, useContext,
} from 'react';

import axios from 'axios';

import ReactFlow, {
  addEdge,
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { makeStyles } from 'tss-react/mui';

import { useDispatch, useSelector } from 'react-redux';
import {
  decrementNodeCount,
  incrementNodeCount,
  selectNode,
  unselectNodes,
  setSavedChanges,
  nextModelerStep,
  removeSelectedFeature,
  setGeoResolutionColumn,
  setTimeResolutionColumn,
  setFlowcastJobId,
} from './dagSlice';

import LoadNode from './nodes/LoadNode';
import SaveNode from './nodes/SaveNode';
import MultiplyNode from './nodes/MultiplyNode';
import ThresholdNode from './nodes/ThresholdNode';
import FilterByCountryNode from './nodes/FilterByCountryNode';
import SumNode from './nodes/SumNode';
import MaskToDistanceFieldNode from './nodes/MaskToDistanceFieldNode';
import ScalarOperationNode from './nodes/ScalarOperationNode';
import SelectSliceNode from './nodes/SelectSliceNode';
import Footer from './Footer';
import ModelerResolution from './ModelerResolution';
import DragBar from './DragBar';
import { ThemeContext } from '../components/ThemeContextProvider';
import { drawerWidth } from '../components/Sidebar';
import { pageSlideAnimation } from '../components/NavBar';

import './overview.css';

import {
  dimensions, threshold_ops,
} from './constants';

const nodeTypes = {
  load: LoadNode,
  save: SaveNode,
  multiply: MultiplyNode,
  threshold: ThresholdNode,
  filter_by_country: FilterByCountryNode,
  sum: SumNode,
  scalar_operation: ScalarOperationNode,
  mask_to_distance_field: MaskToDistanceFieldNode,
  select_slice: SelectSliceNode,
};

// set up the labels/initial values for the sum/reduce_by checkboxes
const sumCheckboxes = dimensions.reduce((checkboxes, label) => {
  // eslint-disable-next-line no-param-reassign
  checkboxes[label] = false;
  return checkboxes;
}, {});

// the default initial values for a new Select Slice form, which can be user created
const createDefaultSelectSlice = () => ({
  // include a 'key' value for our React mapping so we can delete & reorder safely
  key: crypto.randomUUID(),
  dimension: '',
  index: '',
});

// This sets up the inputs for each node. Any new input has to be added here
// in order for it to be recognized by react flow
const initialNodeTypeValues = {
  load: {
    data_source: '',
    geo_aggregation_function: '',
    time_aggregation_function: '',
  },
  save: {
    name: '',
    description: '',
  },
  sum: {
    ...sumCheckboxes,
    aggregation: 'sum',
  },
  threshold: {
    value: '',
    type: threshold_ops[0]
  },
  filter_by_country: [],
  multiply: 'multiply',
  scalar_operation: {
    operation: 'add',
    value: '0',
    scalar_position_divide: 'denominator',
    scalar_position_power: 'exponent',
  },
  select_slice: [createDefaultSelectSlice()],
  mask_to_distance_field: {
    include_initial_points: false,
  },
};

const genNodeId = () => `n_${window.crypto.randomUUID()}`;

const genNode = (type, position) => {
  const id = genNodeId();

  return {
    id,
    type,
    position,
    data: { label: type, input: initialNodeTypeValues[type] },
  };
};

const useStyles = makeStyles()((theme) => ({
  innerWrapper: {
    display: 'flex',
    // slightly more spacing than the height of the footer accounts for retina displays
    // otherwise we get a persistent scrollbar on retina
    height: 'calc(100% - 40px)',
    minHeight: '620px',
  },
  fullWrapper: {
    position: 'absolute',
    // this puts us below the height of our toolbar by a few px, as we use the dense variant
    top: theme.mixins.toolbar.minHeight,
    bottom: '0',
    right: '0',
    overflow: 'auto',
  },
  reactFlowStyleWrapper: {
    width: '100%',
    minHeight: '400px',
    minWidth: '400px',
  },
  opaqueButton: {
    backgroundColor: 'white',
    color: 'black',
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  lowerSidebar: {
    margin: `${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(2)}`,
  },
  wholeSidebar: {
    width: '255px',
  },
}));

const PipeEditor = () => {
  const reactFlowWrapper = useRef(null);
  const { classes } = useStyles();
  const {
    geoResolutionColumn, timeResolutionColumn
  } = useSelector((state) => state.dag);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // TODO: only used in onRestore, remove if removing that
  // const { setViewport } = useReactFlow();

  const dispatch = useDispatch();

  const { setShowSideBar } = useContext(ThemeContext);

  useEffect(() => {
    // hide the Sidebar when the component mounts
    setShowSideBar(false);
    // when the component unmounts, toggle the Sidebar back
    return () => setShowSideBar(true);
  }, [setShowSideBar]);

  const setSelectedNode = useCallback((node) => {
    dispatch(selectNode({ id: node.id, type: node.type }));
  }, [dispatch]);

  const setCurrentNode = useCallback((event, nodeEl) => {
    const node = nodes.find((n) => n.id === nodeEl.id);
    setSelectedNode(node);
  }, [nodes, setSelectedNode]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onInit = (rfInstance) => {
    console.log('Flow loaded:', rfInstance);
    setReactFlowInstance(rfInstance);
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // This controls how the data from a node's inputs makes it into react flow
  const onNodeChange = useCallback((currNodeId, event, index) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id !== currNodeId) {
        return node;
      }

      let input;
      if (node.type === 'select_slice') {
        // handle multiple generated forms within the same node
        input = [...node.data.input]; // shallow copy the existing array

        if (event === 'addSelectSlice') {
          // a special manually generated 'event' to create empty initial values for a new form
          input[index] = createDefaultSelectSlice();
        } else if (event === 'removeSelectSlice') {
          // remove the item at specified index
          input = input.toSpliced(index, 1);
        } else {
          input[index] = {
            ...input[index],
            [event.target.name]: event.target.value,
          };
        }
      } else if (
        node.type === 'load'
        || node.type === 'save'
        || node.type === 'scalar_operation'
        || node.type === 'threshold'
        || node.type === 'sum'
        || node.type === 'mask_to_distance_field'
      ) {
        // checkbox is the only input type (so far) that takes a different event.target than value
        const event_type = (
          event.target.type === 'checkbox'
        ) ? 'checked' : 'value';

        input = {
          ...node.data.input,
          [event.target.name]: event.target[event_type]
        };
      } else {
        input = event.target.value;
      }

      return {
        ...node,
        data: {
          ...node.data,
          input
        },
      };
    }));
  }, [setNodes]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = genNode(type, position);
      newNode.data.onChange = onNodeChange;

      setNodes((nds) => nds.concat(newNode));
      dispatch(incrementNodeCount());
      setSelectedNode(newNode);
    },
    [reactFlowInstance, dispatch, onNodeChange, setNodes, setSelectedNode]
  );

  const edgesWithUpdatedTypes = edges.map((edge) => {
    // TODO: remove this when time, removing it breaks the connections at the moment
    // we aren't using multiple types now
    // eslint-disable-next-line no-param-reassign
    edge.type = 'default';
    return edge;
  });

  const onSave = useCallback(() => {
    let forBackend;
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      // add our resolution as a top level key
      flow.resolution = { geoResolutionColumn, timeResolutionColumn };

      // set the whole react-flow object in localStorage so we can recreate it
      window.localStorage.setItem('dagpipes-flow-session', JSON.stringify(flow));
      // toggle the unsavedChanges state
      dispatch(setSavedChanges());

      // remove viewport as the backend doesn't need it
      forBackend = { ...flow };
      delete forBackend.viewport;

      // TODO: is this actually what the backend needs?
      // parse the edges and nodes into just what the backend cares about
      forBackend.edges = forBackend.edges.map((e) => (
        { source: e.source, target: e.target, id: e.id }
      ));
      forBackend.nodes = forBackend.nodes.map((e) => ({ type: e.type, data: e.data, id: e.id }));
      // TODO: actually send the contents
      console.log(JSON.stringify(forBackend, 2, null));
    }
    return forBackend;
  }, [reactFlowInstance, dispatch, geoResolutionColumn, timeResolutionColumn]);

  // // TODO: do we want to keep restore? it currently doesn't work with the redux state
  // const onRestore = useCallback(() => {
  //   const restoreFlow = async () => {
  //     const flow = JSON.parse(localStorage.getItem('dagpipes-flow-session'));

  //     if (flow) {
  //       const { x = 0, y = 0, zoom = 1 } = flow.viewport;

  //       // extract nodes from the loaded flow, rename for use within this function
  //       // so it doesn't conflict with upper scope `nodes` name, and provide a default []
  //       const { nodes: flowNodes = [] } = flow;
  //       // loop over the loaded nodes and apply our onNodeChange function to them
  //       // this gets applied when a node is dropped in onDrop
  //       // eslint-disable-next-line no-param-reassign
  //       flowNodes.forEach((n) => { n.data.onChange = onNodeChange; });
  //       setNodes(flowNodes);
  //       setEdges(flow.edges || []);
  //       dispatch(setNodeCount(flowNodes.length));
  //       setViewport({ x, y, zoom });
  //     }
  //   };

  //   restoreFlow();
  // }, [setNodes, dispatch, onNodeChange, setEdges, setViewport]);

  const onNodesDelete = useCallback((deletedNodes) => {
    dispatch(decrementNodeCount());
    deletedNodes.forEach((node) => {
      if (node.type === 'load') {
        // All the following are in the redux state and not in react-flow, so manually manage them
        const featureId = node.data.input.data_source;
        // clear the selected features from our redux state - we use this to prevent duplicate
        // features in Load Nodes, so we have to clear it when we delete the node
        dispatch(removeSelectedFeature(featureId));

        // clear geo or resolution if either match the featureId - these are also in redux state
        if (featureId === geoResolutionColumn) dispatch(setGeoResolutionColumn(null));
        if (featureId === timeResolutionColumn) dispatch(setTimeResolutionColumn(null));
      }
    });
  }, [dispatch, geoResolutionColumn, timeResolutionColumn]);

  // TODO: don't let this happen/disable button if there are no nodes
  const onProcessClick = () => {
    // TODO: spinner while waiting for response?
    const flowValue = onSave();

    axios.post(
      '/api/dojo/data-modeling',
      { data: flowValue },
      { headers: { 'Content-Type': 'application/json' } }
    ).then((resp) => {
      console.log('Successfully created data modeling on the backend:', resp);
      const UUID = crypto.randomUUID();
      axios.post(
        `/api/dojo/job/${UUID}/data_modeling.run_flowcast_job`,
        { context: { dag: flowValue } },
        { headers: { 'Content-Type': 'application/json' } }
      ).then((successResp) => {
        console.log('Successfully started the Run Flowcast job', successResp);
        dispatch(setFlowcastJobId(successResp.data.id));
        dispatch(nextModelerStep());
      // TODO: snackbar errors for both of these
      // since they stop processing/next step from happening
      }).catch((error) => console.log('There was an error starting the Flowcast job:', error));
    }).catch((error) => console.log('There was an error creating the data modeling:', error));
  };

  const processDisabled = !geoResolutionColumn || !timeResolutionColumn || !nodes.length;
  let disabledProcessTooltip = 'Please select ';

  if (!geoResolutionColumn && !timeResolutionColumn) {
    // both geo and time are missing
    disabledProcessTooltip += 'both geo and time resolutions in Load Nodes or sidebar';
  } else if (!geoResolutionColumn) {
    // only geo is missing
    disabledProcessTooltip += 'geo resolution in Load Nodes or sidebar';
  } else if (!timeResolutionColumn) {
    // only time is missing
    disabledProcessTooltip += 'time resolution in Load Nodes or sidebar';
  } else if (!nodes.length) {
    // if both resolutions are chosen but no nodes
    disabledProcessTooltip = 'Please ensure nodes are added to the graph';
  }

  return (
    <div className={classes.innerWrapper}>
      <div
        className={classes.reactFlowStyleWrapper}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edgesWithUpdatedTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onNodeClick={setCurrentNode}
          onPaneClick={() => dispatch(unselectNodes())}
          onConnect={onConnect}
          onInit={onInit}
          snapToGrid
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <Controls />
          <Background
            color="#aaa"
            gap={16}
          />

        </ReactFlow>
        {/* <Panel position="top-left">
          <ButtonGroup disableElevation>
            <Button
              variant="outlined"
              className={classes.opaqueButton}
              onClick={onSave}
            >
              SAVE
            </Button>
            <Button
              variant="outlined"
              className={classes.opaqueButton}
              onClick={onRestore}
            >
              LOAD
            </Button>
          </ButtonGroup>
        </Panel>*/}
      </div>
      <div className={classes.wholeSidebar}>
        <DragBar />
        <div className={classes.lowerSidebar}>
          <ModelerResolution />
          <Tooltip title={processDisabled ? disabledProcessTooltip : ''}>
            <span>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={processDisabled}
                onClick={onProcessClick}
                sx={{ marginTop: 2 }}
              >
                Process
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const PipeEditorWrapper = () => {
  const { classes } = useStyles();
  const { showSideBar } = useContext(ThemeContext);
  return (
    <Box
      className={classes.fullWrapper}
      sx={(theme) => ({
        left: 0,
        // use the same transition animation as the sidebar, defined in NavBar.js
        ...pageSlideAnimation(theme, 'left'),
        ...(showSideBar && {
          left: drawerWidth,
        }),
      })}
    >
      <ReactFlowProvider>
        <PipeEditor />
      </ReactFlowProvider>
      <Footer />
    </Box>
  );
};

export default PipeEditorWrapper;
