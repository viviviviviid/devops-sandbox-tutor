'use client';

import { useCanvasStore } from '@/store/canvas';
import { useAIStore } from '@/store/ai';

export default function Toolbar() {
  const { exportDiagram, importDiagram, clearCanvas, nodes, edges } = useCanvasStore();
  const { addMessage } = useAIStore();

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
      nodes: nodes.map((n) => ({ id: n.id, type: n.data.serviceId, label: n.data.label, config: n.data.config })),
      edges: edges.map((e) => ({ from: e.source, to: e.target })),
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

      <ToolbarButton onClick={handleAutoReview} color="#4299e1">
        🔍 AI 검토
      </ToolbarButton>

      <div style={{ flex: 1 }} />

      <span style={{ color: '#4a5568', fontSize: '11px' }}>
        {nodes.length}개 서비스 · {edges.length}개 연결
      </span>

      <div style={{ width: '1px', height: '24px', background: '#2d3748' }} />

      <ToolbarButton onClick={handleImport}>📂 불러오기</ToolbarButton>
      <ToolbarButton onClick={handleExport}>💾 저장</ToolbarButton>
      <ToolbarButton onClick={handleClear} color="#fc8181">🗑 초기화</ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  color = '#a0aec0',
}: {
  children: React.ReactNode;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
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
