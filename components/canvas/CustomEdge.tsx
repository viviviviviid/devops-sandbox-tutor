'use client';

import { useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/react';
import { useCanvasStore, EdgeData } from '@/store/canvas';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const { updateEdgeData } = useCanvasStore();
  const edgeData = (data as EdgeData | undefined) ?? { edgeType: 'smoothstep' };
  const color = edgeData.color ?? '#4299e1';
  const edgeType = edgeData.edgeType ?? 'smoothstep';

  const [editing, setEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(edgeData.label ?? '');

  const pathProps = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition };

  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (edgeType === 'bezier') {
    [edgePath, labelX, labelY] = getBezierPath(pathProps);
  } else if (edgeType === 'step') {
    [edgePath, labelX, labelY] = getStraightPath(pathProps);
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath(pathProps);
  }

  const onDoubleClick = useCallback(() => {
    setLabelValue(edgeData.label ?? '');
    setEditing(true);
  }, [edgeData.label]);

  const commitLabel = useCallback(() => {
    updateEdgeData(id, { label: labelValue });
    setEditing(false);
  }, [id, labelValue, updateEdgeData]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitLabel();
      if (e.key === 'Escape') setEditing(false);
    },
    [commitLabel]
  );

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          cursor: 'pointer',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onDoubleClick={onDoubleClick}
        >
          {editing ? (
            <input
              autoFocus
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={onKeyDown}
              style={{
                background: '#1a1f2e',
                border: `1px solid ${color}`,
                borderRadius: '4px',
                color: '#e2e8f0',
                fontSize: '11px',
                padding: '2px 6px',
                outline: 'none',
                width: '100px',
              }}
            />
          ) : edgeData.label ? (
            <div
              style={{
                background: '#1a1f2e',
                border: `1px solid ${color}40`,
                borderRadius: '4px',
                color: '#e2e8f0',
                fontSize: '11px',
                padding: '2px 6px',
                cursor: 'text',
              }}
            >
              {edgeData.label}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
