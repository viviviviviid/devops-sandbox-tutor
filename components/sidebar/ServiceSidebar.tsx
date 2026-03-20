'use client';

import { useState } from 'react';
import { AWS_SERVICES, CATEGORIES } from '@/lib/aws-services';
import { SCENARIOS, DIFFICULTY_COLOR, Scenario } from '@/lib/scenarios';
import { useScenarioStore } from '@/store/scenario';
import { useAIStore } from '@/store/ai';

const GROUP_ITEMS = [
  { id: 'vpc-group', label: 'VPC', color: '#8b5cf6' },
  { id: 'public-subnet', label: 'Public Subnet', color: '#10b981' },
  { id: 'private-subnet', label: 'Private Subnet', color: '#3b82f6' },
  { id: 'az-group', label: 'Availability Zone', color: '#f59e0b' },
];

export default function ServiceSidebar() {
  const [tab, setTab] = useState<'services' | 'scenarios'>('services');

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        background: '#1a1f2e',
        borderRight: '1px solid #2d3748',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 탭 헤더 */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2d3748' }}>
        {(['services', 'scenarios'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid #4299e1' : '2px solid transparent',
              color: tab === t ? '#4299e1' : '#718096',
              fontSize: '11px',
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.3px',
            }}
          >
            {t === 'services' ? '☁️ 서비스' : '📚 학습'}
          </button>
        ))}
      </div>

      {tab === 'services' ? <ServicesTab /> : <ScenariosTab />}
    </aside>
  );
}

/* ─────────────── 서비스 탭 ─────────────── */

function ServicesTab() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = AWS_SERVICES.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory ? s.category === activeCategory : true;
    return matchSearch && matchCategory;
  });

  const onDragStart = (e: React.DragEvent, serviceId: string) => {
    e.dataTransfer.setData('application/aws-service', serviceId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onGroupDragStart = (e: React.DragEvent, item: typeof GROUP_ITEMS[0]) => {
    e.dataTransfer.setData('application/aws-group', '1');
    e.dataTransfer.setData('application/group-label', item.label);
    e.dataTransfer.setData('application/group-color', item.color);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div style={{ padding: '10px 12px 8px' }}>
        <input
          type="text"
          placeholder="검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: '#0f1117',
            border: '1px solid #2d3748',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#e2e8f0',
            fontSize: '12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {!search && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 8px 8px', borderBottom: '1px solid #2d3748' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={filterBtnStyle(activeCategory === null)}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              style={filterBtnStyle(activeCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {!search && !activeCategory && (
        <div style={{ padding: '8px' }}>
          <div style={{ color: '#718096', fontSize: '10px', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.5px' }}>
            그룹 컨테이너
          </div>
          {GROUP_ITEMS.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onGroupDragStart(e, item)}
              style={{
                padding: '6px 10px',
                marginBottom: '4px',
                borderRadius: '6px',
                border: `1px dashed ${item.color}60`,
                background: `${item.color}10`,
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: item.color,
                fontWeight: 600,
              }}
            >
              <span>□</span>
              {item.label}
            </div>
          ))}
        </div>
      )}

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
        {!search && !activeCategory ? (
          CATEGORIES.map((cat) => {
            const catServices = filtered.filter((s) => s.category === cat);
            if (catServices.length === 0) return null;
            return (
              <div key={cat}>
                <div style={{ color: '#718096', fontSize: '10px', marginBottom: '6px', marginTop: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {cat.toUpperCase()}
                </div>
                {catServices.map((service) => (
                  <ServiceItem key={service.id} service={service} onDragStart={onDragStart} />
                ))}
              </div>
            );
          })
        ) : (
          filtered.map((service) => (
            <ServiceItem key={service.id} service={service} onDragStart={onDragStart} />
          ))
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #2d3748', color: '#4a5568', fontSize: '10px' }}>
        드래그하여 캔버스에 배치
      </div>
    </>
  );
}

/* ─────────────── 학습 탭 ─────────────── */

function ScenariosTab() {
  const { activeScenario, completedItems, startScenario, exitScenario, toggleItem } = useScenarioStore();
  const { addMessage } = useAIStore();

  const handleStart = (scenario: Scenario) => {
    startScenario(scenario);
    addMessage('assistant', scenario.aiHint);
  };

  if (activeScenario) {
    const doneCount = completedItems.filter(Boolean).length;
    const total = activeScenario.checklist.length;
    const progress = Math.round((doneCount / total) * 100);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* 진행 중 헤더 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #2d3748' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}>
                {activeScenario.title}
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: `${DIFFICULTY_COLOR[activeScenario.difficulty]}20`,
                color: DIFFICULTY_COLOR[activeScenario.difficulty],
              }}>
                {activeScenario.difficulty}
              </span>
            </div>
            <button
              onClick={exitScenario}
              style={{
                background: 'transparent',
                border: '1px solid #2d3748',
                borderRadius: '4px',
                color: '#718096',
                fontSize: '10px',
                padding: '2px 8px',
                cursor: 'pointer',
              }}
            >
              나가기
            </button>
          </div>

          {/* 진행률 바 */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: '#718096' }}>진행률</span>
              <span style={{ fontSize: '10px', color: progress === 100 ? '#68d391' : '#4299e1', fontWeight: 700 }}>
                {doneCount}/{total}
              </span>
            </div>
            <div style={{ height: '4px', background: '#2d3748', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? '#68d391' : '#4299e1',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>

        {/* 목표 */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #2d3748', background: '#0f1117' }}>
          <div style={{ color: '#718096', fontSize: '10px', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px' }}>목표</div>
          <div style={{ color: '#a0aec0', fontSize: '11px', lineHeight: 1.5 }}>{activeScenario.goal}</div>
        </div>

        {/* 체크리스트 */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 12px' }}>
          <div style={{ color: '#718096', fontSize: '10px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>체크리스트</div>
          {activeScenario.checklist.map((item, i) => (
            <div
              key={i}
              onClick={() => toggleItem(i)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '6px 4px',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '2px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#2d374830'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                minWidth: '14px',
                borderRadius: '3px',
                border: `1px solid ${completedItems[i] ? '#68d391' : '#4a5568'}`,
                background: completedItems[i] ? '#68d391' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '1px',
                transition: 'all 0.15s',
              }}>
                {completedItems[i] && <span style={{ color: '#1a1f2e', fontSize: '9px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{
                fontSize: '11px',
                color: completedItems[i] ? '#4a5568' : '#a0aec0',
                textDecoration: completedItems[i] ? 'line-through' : 'none',
                lineHeight: 1.4,
                transition: 'all 0.15s',
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {progress === 100 && (
          <div style={{
            padding: '12px',
            borderTop: '1px solid #2d3748',
            background: '#1a2e1a',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎉</div>
            <div style={{ color: '#68d391', fontSize: '11px', fontWeight: 700 }}>시나리오 완료!</div>
            <div style={{ color: '#4a5568', fontSize: '10px', marginTop: '2px' }}>AI에게 아키텍처 검토를 요청해보세요</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', flex: 1, padding: '10px 8px' }}>
      <div style={{ color: '#718096', fontSize: '10px', fontWeight: 600, marginBottom: '10px', letterSpacing: '0.5px', padding: '0 4px' }}>
        학습 시나리오를 선택하세요
      </div>
      {SCENARIOS.map((scenario) => (
        <div
          key={scenario.id}
          style={{
            background: '#0f1117',
            border: '1px solid #2d3748',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#4299e1';
            (e.currentTarget as HTMLDivElement).style.background = '#0f1117ee';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = '#2d3748';
            (e.currentTarget as HTMLDivElement).style.background = '#0f1117';
          }}
          onClick={() => handleStart(scenario)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 700 }}>{scenario.title}</div>
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              background: `${DIFFICULTY_COLOR[scenario.difficulty]}20`,
              color: DIFFICULTY_COLOR[scenario.difficulty],
              whiteSpace: 'nowrap',
            }}>
              {scenario.difficulty}
            </span>
          </div>
          <div style={{ color: '#718096', fontSize: '10px', lineHeight: 1.5 }}>{scenario.description}</div>
          <div style={{ marginTop: '6px', color: '#4299e1', fontSize: '10px', fontWeight: 600 }}>
            체크리스트 {scenario.checklist.length}개 →
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── 공통 컴포넌트 ─────────────── */

function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '2px 8px',
    fontSize: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    background: active ? '#4299e1' : '#2d3748',
    color: '#e2e8f0',
    fontWeight: active ? 700 : 400,
  };
}

function ServiceItem({
  service,
  onDragStart,
}: {
  service: (typeof AWS_SERVICES)[0];
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, service.id)}
      title={service.description}
      style={{
        padding: '7px 10px',
        marginBottom: '3px',
        borderRadius: '8px',
        border: '1px solid #2d3748',
        background: '#0f1117',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = service.color;
        (e.currentTarget as HTMLDivElement).style.background = `${service.color}15`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#2d3748';
        (e.currentTarget as HTMLDivElement).style.background = '#0f1117';
      }}
    >
      <span style={{ fontSize: '16px' }}>{service.icon}</span>
      <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>{service.name}</span>
    </div>
  );
}
