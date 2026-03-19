'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '@/store/ai';
import { useCanvasStore } from '@/store/canvas';
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  '이 아키텍처 검토해줘',
  '보안 문제가 있을까?',
  '비용을 줄이려면?',
  '고가용성으로 개선하려면?',
  'VPC 구성 설명해줘',
];

export default function AIPanel() {
  const { messages, isLoading, addMessage, appendToLastAssistant, setLoading } = useAIStore();
  const { nodes, edges } = useCanvasStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getArchitecture = () => ({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data.serviceId || 'group',
      label: n.data.label,
      config: n.data.config,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
    })),
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');

    const userMsg = { role: 'user' as const, content: text };
    addMessage('user', text);
    setLoading(true);

    const allMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      userMsg,
    ];

    addMessage('assistant', '');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          architecture: getArchitecture(),
        }),
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLastAssistant(decoder.decode(value));
      }
    } catch {
      appendToLastAssistant('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <aside
      style={{
        width: '320px',
        minWidth: '320px',
        background: '#1a1f2e',
        borderLeft: '1px solid #2d3748',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '18px' }}>🤖</span>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '13px' }}>AI 아키텍처 튜터</div>
          <div style={{ color: '#4299e1', fontSize: '10px' }}>
            {nodes.length > 0
              ? `${nodes.length}개 서비스 배치됨 · ${edges.length}개 연결`
              : '캔버스가 비어있습니다'}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>☁️</div>
            <div style={{ color: '#718096', fontSize: '13px', lineHeight: 1.6 }}>
              왼쪽에서 AWS 서비스를 캔버스에 배치하고,
              <br />
              아키텍처에 대해 질문해보세요.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '90%',
                padding: '10px 12px',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.role === 'user' ? '#4299e1' : '#0f1117',
                color: '#e2e8f0',
                fontSize: '12px',
                lineHeight: 1.6,
                border: msg.role === 'assistant' ? '1px solid #2d3748' : 'none',
              }}
            >
              {msg.role === 'assistant' ? (
                <div className="prose-sm">
                  <ReactMarkdown>{msg.content || '▌'}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#4299e1',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 질문 */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid #2d3748',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isLoading}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              borderRadius: '12px',
              border: '1px solid #2d3748',
              background: '#0f1117',
              color: '#a0aec0',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#4299e1';
              (e.currentTarget as HTMLButtonElement).style.color = '#4299e1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2d3748';
              (e.currentTarget as HTMLButtonElement).style.color = '#a0aec0';
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div style={{ padding: '10px', borderTop: '1px solid #2d3748' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: '#0f1117',
            border: '1px solid #2d3748',
            borderRadius: '8px',
            padding: '8px',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="질문하세요... (Enter로 전송)"
            rows={2}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#e2e8f0',
              fontSize: '12px',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={{
              background: input.trim() && !isLoading ? '#4299e1' : '#2d3748',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '0 12px',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              transition: 'background 0.15s',
              alignSelf: 'flex-end',
            }}
          >
            ↑
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .prose-sm h1, .prose-sm h2, .prose-sm h3 { color: #e2e8f0; font-weight: 700; margin: 8px 0 4px; }
        .prose-sm h1 { font-size: 14px; }
        .prose-sm h2 { font-size: 13px; }
        .prose-sm h3 { font-size: 12px; }
        .prose-sm p { margin: 4px 0; }
        .prose-sm ul, .prose-sm ol { padding-left: 16px; margin: 4px 0; }
        .prose-sm li { margin: 2px 0; }
        .prose-sm code { background: #1a1f2e; padding: 1px 5px; border-radius: 3px; font-size: 11px; color: #68d391; }
        .prose-sm pre { background: #1a1f2e; padding: 8px; border-radius: 6px; overflow-x: auto; }
        .prose-sm strong { color: #e2e8f0; font-weight: 700; }
        .prose-sm blockquote { border-left: 2px solid #4299e1; padding-left: 8px; color: #718096; }
      `}</style>
    </aside>
  );
}
