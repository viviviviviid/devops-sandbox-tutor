'use client';

import { useEffect } from 'react';

interface ShortcutPanelProps {
  onClose: () => void;
}

const shortcuts = [
  { key: 'Ctrl + Z', desc: '실행취소 (Undo)' },
  { key: 'Ctrl + Y', desc: '다시실행 (Redo)' },
  { key: 'Ctrl + Shift + Z', desc: '다시실행 (Redo)' },
  { key: 'Delete', desc: '선택 노드/에지 삭제' },
  { key: 'Shift + 클릭', desc: '다중 선택' },
  { key: '우클릭 (노드)', desc: '노드 컨텍스트 메뉴' },
  { key: '우클릭 (에지)', desc: '에지 컨텍스트 메뉴' },
  { key: '더블클릭 (에지)', desc: '에지 레이블 편집' },
  { key: '?', desc: '이 패널 토글' },
];

export default function ShortcutPanel({ onClose }: ShortcutPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1f2e',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '360px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
            ⌨️ 키보드 단축키
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4a5568',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shortcuts.map((s) => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  background: '#0f1117',
                  border: '1px solid #2d3748',
                  borderRadius: '4px',
                  color: '#4299e1',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                {s.key}
              </span>
              <span style={{ color: '#a0aec0', fontSize: '12px' }}>{s.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', fontSize: '11px', color: '#4a5568', textAlign: 'center' }}>
          배경 클릭 또는 Esc로 닫기
        </div>
      </div>
    </div>
  );
}
