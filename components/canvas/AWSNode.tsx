'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { getService } from '@/lib/aws-services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AWSNode({ data, selected }: NodeProps<any>) {
  const [hovered, setHovered] = useState(false);
  const service = getService(data.serviceId);

  return (
    <div
      style={{
        background: selected ? '#1e293b' : '#1a1f2e',
        border: `2px solid ${selected ? data.color : '#2d3748'}`,
        borderRadius: '12px',
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 20px ${data.color}40`
          : hovered
          ? `0 6px 20px rgba(0,0,0,0.5)`
          : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
        overflow: 'visible',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent bar */}
      <div
        style={{
          height: '3px',
          background: data.color,
          borderRadius: '10px 10px 0 0',
        }}
      />

      {/* Category badge */}
      {service && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: `${data.color}30`,
            color: data.color,
            fontSize: '8px',
            fontWeight: 600,
            padding: '1px 5px',
            borderRadius: '4px',
            letterSpacing: '0.3px',
            lineHeight: 1.5,
          }}
        >
          {service.category}
        </div>
      )}

      <div style={{ padding: '10px 16px 12px' }}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: data.color, border: 'none', width: 8, height: 8 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: data.color, border: 'none', width: 8, height: 8 }}
        />

        <div style={{ fontSize: '36px', lineHeight: 1.2 }}>{data.icon}</div>
        <div
          style={{
            color: data.color,
            fontWeight: 700,
            fontSize: '11px',
            marginTop: '4px',
            letterSpacing: '0.5px',
          }}
        >
          {data.label}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: data.color, border: 'none', width: 8, height: 8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: data.color, border: 'none', width: 8, height: 8 }}
        />
      </div>

      {/* Hover tooltip */}
      {hovered && service?.description && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: '#0f1117',
            border: `1px solid ${data.color}60`,
            borderRadius: '6px',
            padding: '8px 10px',
            width: '200px',
            fontSize: '11px',
            color: '#a0aec0',
            lineHeight: 1.5,
            zIndex: 100,
            pointerEvents: 'none',
            whiteSpace: 'normal',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {service.description}
        </div>
      )}
    </div>
  );
}

export default memo(AWSNode);
