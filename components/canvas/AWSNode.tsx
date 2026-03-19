'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AWSNode({ data, selected }: NodeProps<any>) {
  return (
    <div
      style={{
        background: selected ? '#1e293b' : '#1a1f2e',
        border: `2px solid ${selected ? data.color : '#2d3748'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: selected
          ? `0 0 20px ${data.color}40`
          : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
      }}
    >
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

      <div style={{ fontSize: '28px', lineHeight: 1.2 }}>{data.icon}</div>
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
  );
}

export default memo(AWSNode);
