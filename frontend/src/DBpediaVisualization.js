import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import EntityNode from './EntityNode';

const nodeTypes = {
  entityNode: EntityNode,
};

const DBpediaVisualization = ({ data }) => {
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);

  React.useEffect(() => {
    if (!data) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const newNodes = data.entities.map((entity, index) => ({
      id: entity.query,
      type: 'entityNode',
      position:
        index === 0
          ? { x: centerX, y: centerY }
          : {
              x:
                centerX +
                Math.cos(index * ((2 * Math.PI) / (data.entities.length - 1))) *
                  300 *
                  (1 - entity.relevance),
              y:
                centerY +
                Math.sin(index * ((2 * Math.PI) / (data.entities.length - 1))) *
                  300 *
                  (1 - entity.relevance),
            },
      data: entity,
    }));

    const newEdges = data.entities.slice(1).map((entity) => ({
      id: `e-${data.entities[0].query}-${entity.query}`,
      source: data.entities[0].query,
      target: entity.query,
      type: 'smoothstep',
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DBpediaVisualization;
