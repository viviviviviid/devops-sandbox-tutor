'use client';

import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  Node,
  Edge,
} from '@xyflow/react';
import { useCanvasStore, NodeData, EdgeData } from '@/store/canvas';
import AWSNode from './AWSNode';
import GroupNode from './GroupNode';
import CustomEdge from './CustomEdge';
import NodeContextMenu from './NodeContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import { getService } from '@/lib/aws-services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = {
  awsNode: AWSNode,
  groupNode: GroupNode,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: any = {
  customEdge: CustomEdge,
};

let nodeIdCounter = 1;

interface ContextMenuState<T> {
  item: T;
  x: number;
  y: number;
}

export default function CanvasArea() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode, snapToGrid } =
    useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [nodeMenu, setNodeMenu] = useState<ContextMenuState<Node<NodeData>> | null>(null);
  const [edgeMenu, setEdgeMenu] = useState<ContextMenuState<Edge> | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const serviceId = e.dataTransfer.getData('application/aws-service');
      const isGroup = e.dataTransfer.getData('application/aws-group');
      if (!serviceId && !isGroup) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      if (isGroup) {
        const groupLabel = e.dataTransfer.getData('application/group-label');
        const groupColor = e.dataTransfer.getData('application/group-color');
        const newNode: Node = {
          id: `group-${nodeIdCounter++}`,
          type: 'groupNode',
          position,
          data: { label: groupLabel, color: groupColor },
          style: { width: 300, height: 200 },
        };
        addNode(newNode as Node<NodeData>);
        return;
      }

      const service = getService(serviceId);
      if (!service) return;

      const newNode: Node<NodeData> = {
        id: `${serviceId}-${nodeIdCounter++}`,
        type: 'awsNode',
        position,
        data: {
          serviceId,
          label: service.name,
          icon: service.icon,
          color: service.color,
          config: { ...service.defaultConfig },
        },
      };
      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setNodeMenu(null);
    setEdgeMenu(null);
  }, [setSelectedNode]);

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault();
      setEdgeMenu(null);
      setNodeMenu({ item: node as Node<NodeData>, x: e.clientX, y: e.clientY });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (e: React.MouseEvent, edge: Edge) => {
      e.preventDefault();
      setNodeMenu(null);
      setEdgeMenu({ item: edge, x: e.clientX, y: e.clientY });
    },
    []
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#2d3748"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as NodeData;
            return data?.color || '#4299e1';
          }}
          maskColor="rgba(15,17,23,0.7)"
        />
      </ReactFlow>

      {nodeMenu && (
        <NodeContextMenu
          node={nodeMenu.item}
          x={nodeMenu.x}
          y={nodeMenu.y}
          onClose={() => setNodeMenu(null)}
        />
      )}

      {edgeMenu && (
        <EdgeContextMenu
          edgeId={edgeMenu.item.id}
          x={edgeMenu.x}
          y={edgeMenu.y}
          edgeData={(edgeMenu.item.data as EdgeData) ?? { edgeType: 'smoothstep' }}
          onClose={() => setEdgeMenu(null)}
        />
      )}
    </div>
  );
}
