'use client';

import { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GroupNode({ data, selected }: NodeProps<any>) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: `2px dashed ${data.color}60`,
        borderRadius: '12px',
        background: `${data.color}08`,
        position: 'relative',
      }}
    >
      <NodeResizer
        color={data.color}
        isVisible={selected}
        minWidth={150}
        minHeight={100}
      />
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          color: data.color,
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}
      >
        {data.label}
      </div>
    </div>
  );
}

export default memo(GroupNode);
