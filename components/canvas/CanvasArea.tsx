'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  Node,
} from '@xyflow/react';
import { useCanvasStore, NodeData } from '@/store/canvas';
import AWSNode from './AWSNode';
import GroupNode from './GroupNode';
import { getService } from '@/lib/aws-services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = {
  awsNode: AWSNode,
  groupNode: GroupNode,
};

let nodeIdCounter = 1;

export default function CanvasArea() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } =
    useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
  }, [setSelectedNode]);

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
        nodeTypes={nodeTypes}
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
    </div>
  );
}
