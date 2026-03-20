'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas';
import { computeScore, scoreColor, CategoryScore } from '@/lib/scoring';

interface ScorePanelProps {
  onClose: () => void;
}

export default function ScorePanel({ onClose }: ScorePanelProps) {
  const { nodes, edges } = useCanvasStore();
  const result = computeScore(nodes, edges);

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
          width: '480px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
            📊 아키텍처 점수
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
          >
            ✕
          </button>
        </div>

        {nodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#4a5568', fontSize: '13px' }}>
            캔버스에 서비스를 배치하면 점수를 볼 수 있습니다.
          </div>
        ) : (
          <>
            {/* 총점 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: '#0f1117', borderRadius: '10px', border: '1px solid #2d3748' }}>
              <ScoreRing score={result.total} size={72} />
              <div>
                <div style={{ color: '#718096', fontSize: '11px', marginBottom: '4px' }}>종합 점수</div>
                <div style={{ color: scoreColor(result.total), fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                  {result.total}
                </div>
                <div style={{ color: '#4a5568', fontSize: '10px', marginTop: '4px' }}>
                  {result.total >= 70 ? '훌륭한 아키텍처입니다!' : result.total >= 40 ? '개선할 부분이 있습니다.' : '기초부터 보완이 필요합니다.'}
                </div>
              </div>
            </div>

            {/* 카테고리별 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.categories.map((cat) => (
                <CategoryBlock key={cat.label} cat={cat} />
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#4a5568', textAlign: 'center' }}>
          배경 클릭 또는 Esc로 닫기
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score, size }: { score: number; size: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2d3748" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function CategoryBlock({ cat }: { cat: CategoryScore }) {
  const color = scoreColor(cat.score);
  return (
    <div style={{ background: '#0f1117', border: '1px solid #2d3748', borderRadius: '8px', padding: '12px' }}>
      {/* 카테고리 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '14px' }}>{cat.emoji}</span>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '12px' }}>{cat.label}</span>
        </div>
        <span style={{ color, fontWeight: 800, fontSize: '14px' }}>{cat.score}점</span>
      </div>

      {/* 진행 바 */}
      <div style={{ height: '3px', background: '#2d3748', borderRadius: '2px', marginBottom: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${cat.score}%`, background: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>

      {/* 규칙 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {cat.rules.map((rule) => (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '12px', lineHeight: '18px', flexShrink: 0 }}>
              {rule.passed ? '✅' : '❌'}
            </span>
            <div>
              <div style={{ color: rule.passed ? '#a0aec0' : '#e2e8f0', fontSize: '11px', fontWeight: rule.passed ? 400 : 500, textDecoration: rule.passed ? 'line-through' : 'none' }}>
                {rule.label}
              </div>
              {!rule.passed && (
                <div style={{ color: '#4a5568', fontSize: '10px', marginTop: '1px', lineHeight: 1.4 }}>
                  {rule.tip}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
