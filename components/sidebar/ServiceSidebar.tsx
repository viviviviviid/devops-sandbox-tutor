'use client';

import { useState } from 'react';
import { AWS_SERVICES, CATEGORIES } from '@/lib/aws-services';

const GROUP_ITEMS = [
  { id: 'vpc-group', label: 'VPC', color: '#8b5cf6' },
  { id: 'public-subnet', label: 'Public Subnet', color: '#10b981' },
  { id: 'private-subnet', label: 'Private Subnet', color: '#3b82f6' },
  { id: 'az-group', label: 'Availability Zone', color: '#f59e0b' },
];

export default function ServiceSidebar() {
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
      {/* 헤더 */}
      <div style={{ padding: '16px 12px 8px', borderBottom: '1px solid #2d3748' }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
          ☁️ AWS 서비스
        </div>
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
          }}
        />
      </div>

      {/* 카테고리 탭 */}
      {!search && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '8px',
            borderBottom: '1px solid #2d3748',
          }}
        >
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeCategory === null ? '#4299e1' : '#2d3748',
              color: '#e2e8f0',
              fontWeight: activeCategory === null ? 700 : 400,
            }}
          >
            전체
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: activeCategory === cat ? '#4299e1' : '#2d3748',
                color: '#e2e8f0',
                fontWeight: activeCategory === cat ? 700 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 그룹 아이템 */}
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

      {/* 서비스 목록 */}
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
    </aside>
  );
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
