'use client';

import { useCallback } from 'react';
import { toPng, toSvg } from 'html-to-image';
import { useReactFlow } from '@xyflow/react';

export function useExportImage() {
  const { getNodes } = useReactFlow();

  const exportAs = useCallback(
    async (format: 'png' | 'svg') => {
      const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
      if (!viewport) return;

      const nodes = getNodes();
      if (nodes.length === 0) {
        alert('캔버스에 노드가 없습니다.');
        return;
      }

      try {
        const convertFn = format === 'png' ? toPng : toSvg;
        const dataUrl = await convertFn(viewport, {
          backgroundColor: '#0f1117',
          style: {
            transform: viewport.style.transform,
          },
        });

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `architecture-${Date.now()}.${format}`;
        a.click();
      } catch (err) {
        console.error('이미지 내보내기 실패:', err);
        alert('이미지 내보내기에 실패했습니다.');
      }
    },
    [getNodes]
  );

  const exportPng = useCallback(() => exportAs('png'), [exportAs]);
  const exportSvg = useCallback(() => exportAs('svg'), [exportAs]);

  return { exportPng, exportSvg };
}
