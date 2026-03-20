'use client';

import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import dynamic from 'next/dynamic';
import ServiceSidebar from '@/components/sidebar/ServiceSidebar';
import AIPanel from '@/components/ai-panel/AIPanel';
import Toolbar from '@/components/canvas/Toolbar';
import ShortcutPanel from '@/components/canvas/ShortcutPanel';

// ReactFlow는 SSR 비활성화 필요
const CanvasArea = dynamic(() => import('@/components/canvas/CanvasArea'), { ssr: false });
const PropertyPanel = dynamic(() => import('@/components/canvas/PropertyPanel'), { ssr: false });

export default function Home() {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === '?') {
        setShowShortcuts((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Toolbar onToggleShortcuts={() => setShowShortcuts((v) => !v)} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ServiceSidebar />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <CanvasArea />
            <PropertyPanel />
          </div>
          <AIPanel />
        </div>
      </div>
      {showShortcuts && <ShortcutPanel onClose={() => setShowShortcuts(false)} />}
    </ReactFlowProvider>
  );
}
