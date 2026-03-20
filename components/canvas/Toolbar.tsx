'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas';
import { useAIStore } from '@/store/ai';
import { useExportImage } from '@/hooks/useExportImage';

interface ToolbarProps {
  onToggleShortcuts: () => void;
}

export default function Toolbar({ onToggleShortcuts }: ToolbarProps) {
  const { exportDiagram, importDiagram, clearCanvas, nodes, edges, undo, redo, canUndo, canRedo, snapToGrid, toggleSnapToGrid } = useCanvasStore();
  const { addMessage } = useAIStore();
  const { exportPng } = useExportImage();

  // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // input 요소에서는 무시
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleExport = () => {
    const json = exportDiagram();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `architecture-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importDiagram(e.target?.result as string);
        } catch {
          alert('올바르지 않은 파일 형식입니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (confirm('캔버스를 초기화하시겠습니까?')) clearCanvas();
  };

  const handleAutoReview = async () => {
    if (nodes.length === 0) {
      addMessage('assistant', '캔버스에 서비스를 먼저 배치해주세요! 왼쪽 사이드바에서 AWS 서비스를 드래그해 캔버스에 올려보세요.');
      return;
    }
    addMessage('user', '현재 아키텍처를 전체적으로 검토해주세요.');

    const architecture = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.serviceId || 'group',
        label: n.data.label,
        config: n.data.config,
        ...(n.parentId ? { parentId: n.parentId } : {}),
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        ...(e.data?.label ? { label: e.data.label as string } : {}),
        ...(e.data?.color ? { color: e.data.color as string } : {}),
      })),
    };

    const { addMessage: am, appendToLastAssistant, setLoading } = useAIStore.getState();
    am('assistant', '');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '현재 아키텍처를 전체적으로 검토해주세요.' }],
          architecture,
        }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLastAssistant(decoder.decode(value));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '48px',
        background: '#1a1f2e',
        borderBottom: '1px solid #2d3748',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
      }}
    >
      {/* 로고 */}
      <div style={{ color: '#4299e1', fontWeight: 800, fontSize: '14px', marginRight: '12px', letterSpacing: '-0.5px' }}>
        ☁️ CloudSandbox
      </div>

      <div style={{ width: '1px', height: '24px', background: '#2d3748' }} />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={undo}
        style={!canUndo ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
        title="실행취소 (Ctrl+Z)"
      >
        ↩ 실행취소
      </ToolbarButton>
      <ToolbarButton
        onClick={redo}
        style={!canRedo ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
        title="다시실행 (Ctrl+Y)"
      >
        ↪ 다시실행
      </ToolbarButton>

      <div style={{ width: '1px', height: '24px', background: '#2d3748' }} />

      <ToolbarButton onClick={handleAutoReview} color="#4299e1">
        🔍 AI 검토
      </ToolbarButton>

      <div style={{ flex: 1 }} />

      <span style={{ color: '#4a5568', fontSize: '11px' }}>
        {nodes.length}개 서비스 · {edges.length}개 연결
      </span>

      <div style={{ width: '1px', height: '24px', background: '#2d3748' }} />

      {/* 스냅 토글 */}
      <ToolbarButton
        onClick={toggleSnapToGrid}
        style={snapToGrid ? { background: '#2d4a6e', borderColor: '#4299e1' } : undefined}
        title="스냅 투 그리드 토글"
      >
        🧲 스냅
      </ToolbarButton>

      <ToolbarButton onClick={exportPng} title="PNG로 내보내기">🖼 PNG 저장</ToolbarButton>
      <ToolbarButton onClick={handleImport}>📂 불러오기</ToolbarButton>
      <ToolbarButton onClick={handleExport}>💾 저장</ToolbarButton>
      <ToolbarButton onClick={handleClear} color="#fc8181">🗑 초기화</ToolbarButton>

      <div style={{ width: '1px', height: '24px', background: '#2d3748' }} />

      <ToolbarButton onClick={onToggleShortcuts} title="단축키 안내">?</ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  color = '#a0aec0',
  style,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
  style?: React.CSSProperties;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: '1px solid #2d3748',
        borderRadius: '6px',
        color,
        padding: '4px 12px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        transition: 'all 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#2d3748';
      }}
      onMouseLeave={(e) => {
        const base = style?.background as string | undefined;
        (e.currentTarget as HTMLButtonElement).style.background = base ?? 'transparent';
      }}
    >
      {children}
    </button>
  );
}
