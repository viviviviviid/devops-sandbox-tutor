'use client';

import { create } from 'zustand';
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange, MarkerType } from '@xyflow/react';

export interface NodeData {
  serviceId: string;
  label: string;
  icon: string;
  color: string;
  config: Record<string, string>;
  [key: string]: unknown;
}

export interface EdgeData {
  edgeType: 'bezier' | 'smoothstep' | 'step';
  label?: string;
  color?: string;
  [key: string]: unknown;
}

interface HistoryEntry {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

interface CanvasStore {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  // History
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Snap to grid
  snapToGrid: boolean;
  toggleSnapToGrid: () => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (node: Node<NodeData>) => void;
  updateNodeConfig: (id: string, config: Record<string, string>) => void;
  updateNodeLabel: (id: string, label: string) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;

  updateEdgeData: (id: string, partial: Partial<EdgeData>) => void;
  deleteEdge: (id: string) => void;

  undo: () => void;
  redo: () => void;

  exportDiagram: () => string;
  importDiagram: (json: string) => void;
  clearCanvas: () => void;
}

const MAX_HISTORY = 50;

export const useCanvasStore = create<CanvasStore>((set, get) => {
  const _pushHistory = () => {
    const { nodes, edges, history, historyIndex } = get();
    const snapshot: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    const newIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    });
  };

  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,

    history: [{ nodes: [], edges: [] }],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    snapToGrid: false,
    toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

    onNodesChange: (changes) => {
      const hasPositionEnd = changes.some(
        (c) => c.type === 'position' && (c as { type: 'position'; dragging?: boolean }).dragging === false
      );
      set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as Node<NodeData>[] }));
      if (hasPositionEnd) {
        _pushHistory();
      }
    },

    onEdgesChange: (changes) =>
      set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

    onConnect: (connection) => {
      _pushHistory();
      const sourceNode = get().nodes.find((n) => n.id === connection.source);
      const color = sourceNode?.data?.color ?? '#4299e1';
      set((state) => ({
        edges: addEdge(
          {
            ...connection,
            type: 'customEdge',
            data: { edgeType: 'smoothstep', label: '', color } as EdgeData,
            markerEnd: { type: MarkerType.ArrowClosed, color },
          },
          state.edges
        ),
      }));
    },

    addNode: (node) => {
      _pushHistory();
      set((state) => ({ nodes: [...state.nodes, node] }));
    },

    updateNodeConfig: (id, config) => {
      _pushHistory();
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, config } } : n
        ),
      }));
    },

    updateNodeLabel: (id, label) => {
      _pushHistory();
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label } } : n
        ),
      }));
    },

    deleteNode: (id) => {
      _pushHistory();
      set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== id),
        edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      }));
    },

    setSelectedNode: (id) => set({ selectedNodeId: id }),

    updateEdgeData: (id, partial) => {
      _pushHistory();
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === id ? { ...e, data: { ...(e.data as EdgeData), ...partial } } : e
        ),
      }));
    },

    deleteEdge: (id) => {
      _pushHistory();
      set((state) => ({
        edges: state.edges.filter((e) => e.id !== id),
      }));
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex <= 0) return;
      const newIndex = historyIndex - 1;
      const entry = history[newIndex];
      set({
        nodes: JSON.parse(JSON.stringify(entry.nodes)),
        edges: JSON.parse(JSON.stringify(entry.edges)),
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        selectedNodeId: null,
      });
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 1) return;
      const newIndex = historyIndex + 1;
      const entry = history[newIndex];
      set({
        nodes: JSON.parse(JSON.stringify(entry.nodes)),
        edges: JSON.parse(JSON.stringify(entry.edges)),
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
        selectedNodeId: null,
      });
    },

    exportDiagram: () => {
      const { nodes, edges } = get();
      return JSON.stringify({ nodes, edges }, null, 2);
    },

    importDiagram: (json) => {
      _pushHistory();
      const { nodes, edges } = JSON.parse(json);
      set({ nodes, edges, selectedNodeId: null });
    },

    clearCanvas: () => {
      _pushHistory();
      set({ nodes: [], edges: [], selectedNodeId: null });
    },
  };
});
