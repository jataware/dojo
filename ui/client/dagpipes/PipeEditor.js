import React, {
  useCallback, useRef, useState
} from 'react';

import ReactFlow, {
  addEdge,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
} from 'reactflow';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

import { makeStyles } from 'tss-react/mui';

import { useDispatch, useSelector } from 'react-redux';
import {
  decrementNodeCount, incrementNodeCount,
  setNodeCount, selectNode, unselectNodes,
  setSavedChanges
} from './dagSlice';

import LoadNode from './LoadNode';
import SaveNode from './SaveNode';
import MultiplyNode from './MultiplyNode';
import ThresholdNode from './ThresholdNode';
import CountrySplitNode from './CountrySplitNode';
import SumNode from './SumNode';
import Footer from './Footer';

import DragBar from './DragBar';

import './overview.css';

import {
  dimensions, threshold_ops
} from './constants';

const nodeTypes = {
  load: LoadNode,
  save: SaveNode,
  multiply: MultiplyNode,
  threshold: ThresholdNode,
  country_split: CountrySplitNode,
  sum: SumNode,
};

const initialNodeTypeValues = {
  load: 'pr',
  save: '',
  sum: (() => {
    const acc = {};
    dimensions.forEach((label) => {
      acc[label] = false;
    });
    return acc;
  })(),
  threshold: {
    value: '',
    type: threshold_ops[0]
  },
  country_split: []
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
    height: '100%'
  },
  fullWrapper: {
    position: 'absolute',
    top: '50px',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  reactFlowStyleWrapper: {
    display: 'flex',
    height: '100%',
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
  processingButtonWrapper: {
    margin: `${theme.spacing(4)} ${theme.spacing(2)} ${theme.spacing(2)}`,
  },
}));

const PipeEditor = ({ setStep }) => {
  const reactFlowWrapper = useRef(null);
  const { classes } = useStyles();
  const {
    geoResolutionColumn, timeResolutionColumn
  } = useSelector((state) => state.dag);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport } = useReactFlow();

  const dispatch = useDispatch();

  const setSelectedNode = useCallback((node) => {
    dispatch(selectNode({ id: node.id, type: node.type }));
  }, [dispatch]);

  const setCurrentNode = useCallback((event, nodeEl) => {
    const node = nodes.find((n) => n.id === nodeEl.id);
    setSelectedNode(node);
  }, [nodes, setSelectedNode]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [miniMapHeight, setMiniMapHeight] = useState(120);

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

  // TODO cleanup
  const onNodeChange = useCallback((currNodeId, event) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id !== currNodeId) {
        return node;
      }

      let input;

      if (node.type === 'sum') {
        input = {
          ...node.data.input,
          [event.target.name]: event.target.checked
        };
      } else if (node.type === 'threshold') {
        const property_changed = event.target.type === 'number' ? 'value' : 'type';

        input = {
          ...node.data.input,
          [property_changed]: event.target.value
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
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();

      window.localStorage.setItem('dagpipes-flow-session', JSON.stringify(flow));
      dispatch(setSavedChanges());

      const forBackend = { ...flow };
      delete forBackend.viewport;

      forBackend.edges = forBackend.edges.map((e) => (
        { source: e.source, target: e.target, id: e.id }
      ));
      forBackend.nodes = forBackend.nodes.map((e) => ({ type: e.type, data: e.data, id: e.id }));
      console.log(JSON.stringify(forBackend, 2, null));
    }
  }, [reactFlowInstance, dispatch]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem('dagpipes-flow-session'));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        // extract nodes from the loaded flow, rename for use within this function
        // so it doesn't conflict with upper scope `nodes` name, and provide a default []
        const { nodes: flowNodes = [] } = flow;
        // loop over the loaded nodes and apply our onNodeChange function to them
        // this gets applied when a node is dropped in onDrop
        // eslint-disable-next-line no-param-reassign
        flowNodes.forEach((n) => { n.data.onChange = onNodeChange; });
        setNodes(flowNodes);
        setEdges(flow.edges || []);
        dispatch(setNodeCount(flowNodes.length));
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, dispatch, onNodeChange, setEdges, setViewport]);

  const onMiniMapClick = () => {
    if (miniMapHeight === 120) {
      setMiniMapHeight(20);
    } else {
      setMiniMapHeight(120);
    }
  };

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
          onNodesDelete={() => dispatch(decrementNodeCount())}
          onNodeClick={setCurrentNode}
          onPaneClick={() => dispatch(unselectNodes())}
          onConnect={onConnect}
          onInit={onInit}
          snapToGrid
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <MiniMap
            style={{ height: miniMapHeight }}
            zoomable
            pannable
            onClick={onMiniMapClick}
          />
          <Controls />
          <Background
            color="#aaa"
            gap={16}
          />

        </ReactFlow>
        <Panel position="top-left">
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
        </Panel>
      </div>
      <div>
        <DragBar />
        <div className={classes.processingButtonWrapper}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={!geoResolutionColumn || !timeResolutionColumn}
            onClick={() => setStep('process')}
          >
            Process
          </Button>
        </div>
      </div>
    </div>
  );
};

const PipeEditorWrapper = ({ setStep }) => {
  const { classes } = useStyles();
  return (
    <div className={classes.fullWrapper}>
      <ReactFlowProvider className={classes.providerWrapper}>
        <PipeEditor setStep={setStep} />
      </ReactFlowProvider>
      <Footer />
    </div>
  );
};

export default PipeEditorWrapper;
