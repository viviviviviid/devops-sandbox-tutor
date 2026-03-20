'use client';

import { useEffect, useRef } from 'react';
import { Node } from '@xyflow/react';
import { useCanvasStore, NodeData } from '@/store/canvas';

interface NodeContextMenuProps {
  node: Node<NodeData>;
  x: number;
  y: number;
  onClose: () => void;
}

let dupCounter = 1000;

export default function NodeContextMenu({ node, x, y, onClose }: NodeContextMenuProps) {
  const { addNode, deleteNode, setSelectedNode } = useCanvasStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handlePointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) onClose();
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('pointerdown', handlePointer);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('pointerdown', handlePointer);
    };
  }, [onClose]);

  const handleDuplicate = () => {
    const newNode: Node<NodeData> = {
      ...node,
      id: `${node.data.serviceId}-dup-${dupCounter++}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      selected: false,
    };
    addNode(newNode);
    onClose();
  };

  const handleEditLabel = () => {
    setSelectedNode(node.id);
    onClose();
  };

  const handleDelete = () => {
    deleteNode(node.id);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '8px',
        padding: '4px',
        zIndex: 1000,
        minWidth: '150px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ padding: '4px 8px', fontSize: '10px', color: '#4a5568', fontWeight: 600, letterSpacing: '0.5px' }}>
        {node.data.label}
      </div>
      <MenuItem onClick={handleDuplicate}>📋 복제</MenuItem>
      <MenuItem onClick={handleEditLabel}>✏️ 레이블 수정</MenuItem>
      <div style={{ height: '1px', background: '#2d3748', margin: '4px 0' }} />
      <MenuItem onClick={handleDelete} danger>
        🗑 삭제
      </MenuItem>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: danger ? '#fc8181' : '#e2e8f0',
        padding: '6px 8px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#2d3748';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
