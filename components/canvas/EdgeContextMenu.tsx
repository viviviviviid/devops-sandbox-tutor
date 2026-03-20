'use client';

import { useEffect, useRef } from 'react';
import { useCanvasStore, EdgeData } from '@/store/canvas';

interface EdgeContextMenuProps {
  edgeId: string;
  x: number;
  y: number;
  edgeData: EdgeData;
  onClose: () => void;
}

export default function EdgeContextMenu({ edgeId, x, y, edgeData, onClose }: EdgeContextMenuProps) {
  const { updateEdgeData, deleteEdge } = useCanvasStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handlePointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('pointerdown', handlePointer);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('pointerdown', handlePointer);
    };
  }, [onClose]);

  const setType = (edgeType: EdgeData['edgeType']) => {
    updateEdgeData(edgeId, { edgeType });
    onClose();
  };

  const handleDelete = () => {
    deleteEdge(edgeId);
    onClose();
  };

  const types: { value: EdgeData['edgeType']; label: string }[] = [
    { value: 'smoothstep', label: '곡선 (Smooth Step)' },
    { value: 'bezier', label: '베지어 (Bezier)' },
    { value: 'step', label: '직선 (Straight)' },
  ];

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
        minWidth: '160px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ padding: '4px 8px', fontSize: '10px', color: '#4a5568', fontWeight: 600, letterSpacing: '0.5px' }}>
        에지 타입
      </div>
      {types.map((t) => (
        <MenuItem
          key={t.value}
          onClick={() => setType(t.value)}
          active={edgeData.edgeType === t.value}
        >
          {t.label}
        </MenuItem>
      ))}
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
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        background: active ? '#2d3748' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: danger ? '#fc8181' : active ? '#4299e1' : '#e2e8f0',
        padding: '6px 8px',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#2d3748';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}
