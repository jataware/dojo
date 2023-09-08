import React, { useCallback, useRef, useState, useEffect } from 'react';

import ReactFlow, {
  addEdge,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

import { useSelector, useDispatch } from 'react-redux';
import { decrementNodeCount, incrementNodeCount,
         setNodeCount, selectNode, unselectNodes,
         setSelectedNodeLabel, setSelectedNodeInput,
         setSavedChanges
       } from './dagSlice';

import { nodes as initialNodes, edges as initialEdges } from './initial-elements';

import LoadNode from './LoadNode';
import SaveNode from './SaveNode';
import MultiplyNode from './MultiplyNode';
import ThresholdNode from './ThresholdNode';
import CountrySplitNode from './CountrySplitNode';
import SumNode from './SumNode';

import DragBar from './DragBar';
import NodePropertyEditor from './NodePropertyEditor';

import './overview.css';

import { data, scenarios, dimensions, threshold_ops } from './constants';

const nodeTypes = {
  load: LoadNode,
  save: SaveNode,
  multiply: MultiplyNode,
  threshold: ThresholdNode,
  country_split: CountrySplitNode,
  sum: SumNode,
};

const minimapStyle = {
  height: 120,
};

const nodeTypeStyles = {
  input: {
    borderColor: 'green'
  },
  output: {
    borderColor: 'blue'
  },
  default: {}
};

const initialNodeTypeValues = {
  load: 'pr',
  save: '',
  sum: (() => {
    let acc = {};
    dimensions.forEach(label => {
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
const genEdgeId = () => `e_${window.crypto.randomUUID()}`;

const genNode = (type, position) => {
  const id = genNodeId();

  return {
    id,
    type,
    position,
    data: { label: type, input: initialNodeTypeValues[type] },
  };
};


const OverviewFlow = () => {

  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const {
    selectedNodeId, selectedNodeLabel, selectedNodeInput, edgeType
  } = useSelector((state) => state.dag);

  const dispatch = useDispatch();

  const setSelectedNode = (node) => {
    dispatch(selectNode({id: node.id, type: node.type}));
  };

  const setCurrentNode = (event, nodeEl) => {
		const node = nodes.find((n) => n.id === nodeEl.id);
    setSelectedNode(node);
	};

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onInit = (reactFlowInstance) => {
    console.log('Flow loaded:', reactFlowInstance);
    setReactFlowInstance(reactFlowInstance);
  };

  const onConnect = useCallback((params) => {
    return setEdges((eds) => {
      return addEdge(params, eds);
    });
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // TODO cleanup
  const onNodeChange = (currNodeId, event) => {

    setNodes((nds) =>
      nds.map((node) => {
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
      })
    );
  };

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
    [reactFlowInstance]
  );

  const edgesWithUpdatedTypes = edges.map((edge) => {
    edge.type = edgeType;
    return edge;
  });

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();

      window.localStorage.setItem('dagpipes-flow-session', JSON.stringify(flow));
      dispatch(setSavedChanges());

      const forBackend = {...flow};
      delete forBackend.viewport;

      forBackend.edges = forBackend.edges.map(e => ({source: e.source, target: e.target, id: e.id}));
      forBackend.nodes = forBackend.nodes.map(e => ({type: e.type, data: e.data, id: e.id}));
      console.log(JSON.stringify(forBackend, 2, null));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem('dagpipes-flow-session'));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;

        const {nodes=[]} = flow;
        nodes.map(n => {n.data.onChange = onNodeChange; return n;});
        setNodes(nodes);
        setEdges(flow.edges || []);
        dispatch(setNodeCount(nodes.length));
        // setViewport({ x, y, zoom }); // TODO
      }
    };

    restoreFlow();
  }, [setNodes// , setViewport
     ]);

  return (
    <div className="wrap-full-size">
      <ReactFlowProvider>
        <div
          className="reactflow-wrapper"
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
            fitView
            snapToGrid
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <MiniMap
              style={minimapStyle}
              zoomable
              pannable
            />
            <Controls />
            <Background
              color="#aaa"
              gap={16}
            />

            {/* selectedNodeId && ( */
            /*   <Panel position="top-right" style={{background: 'white'}}> */
            /*     <NodePropertyEditor /> */
            /*   </Panel> */
            /* ) */}

          </ReactFlow>
        </div>
        <Panel position="top-left">
          <ButtonGroup disableElevation>
            <Button onClick={onSave}>SAVE</Button>
            <Button onClick={onRestore}>LOAD</Button>
          </ButtonGroup>
        </Panel>
        <Panel position="bottom-center">
          <DragBar />
        </Panel>
      </ReactFlowProvider>
    </div>
  );
};

export default OverviewFlow;
