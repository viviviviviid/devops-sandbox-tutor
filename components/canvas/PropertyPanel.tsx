'use client';

import { useCanvasStore } from '@/store/canvas';
import { getService } from '@/lib/aws-services';

export default function PropertyPanel() {
  const { nodes, selectedNodeId, updateNodeConfig, updateNodeLabel, deleteNode } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode || selectedNode.type === 'groupNode') return null;

  const data = selectedNode.data;
  const service = getService(data.serviceId);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1f2e',
        border: `1px solid ${data.color}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '420px',
        zIndex: 10,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${data.color}20`,
      }}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{data.icon}</span>
        <div style={{ flex: 1 }}>
          <input
            value={data.label}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: data.color,
              fontWeight: 700,
              fontSize: '14px',
              outline: 'none',
              width: '100%',
            }}
          />
          <div style={{ color: '#718096', fontSize: '11px' }}>{service?.category}</div>
        </div>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          style={{
            background: '#7f1d1d',
            border: 'none',
            borderRadius: '6px',
            color: '#fca5a5',
            padding: '4px 8px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          삭제
        </button>
      </div>

      {/* 설명 */}
      {service && (
        <div
          style={{
            background: '#0f1117',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#a0aec0',
            lineHeight: '1.5',
          }}
        >
          {service.description}
        </div>
      )}

      {/* 설정값 */}
      {Object.keys(data.config).length > 0 && (
        <div>
          <div style={{ color: '#718096', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>
            설정
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.entries(data.config).map(([key, value]) => (
              <div key={key}>
                <div style={{ color: '#4a5568', fontSize: '10px', marginBottom: '2px' }}>{key}</div>
                <input
                  value={value}
                  onChange={(e) => {
                    updateNodeConfig(selectedNode.id, {
                      ...data.config,
                      [key]: e.target.value,
                    });
                  }}
                  style={{
                    width: '100%',
                    background: '#0f1117',
                    border: '1px solid #2d3748',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#e2e8f0',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px', color: '#4a5568', fontSize: '10px' }}>
        ID: {selectedNode.id}
      </div>
    </div>
  );
}
