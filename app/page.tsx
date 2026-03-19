'use client';

import { ReactFlowProvider } from '@xyflow/react';
import dynamic from 'next/dynamic';
import ServiceSidebar from '@/components/sidebar/ServiceSidebar';
import AIPanel from '@/components/ai-panel/AIPanel';
import Toolbar from '@/components/canvas/Toolbar';

// ReactFlow는 SSR 비활성화 필요
const CanvasArea = dynamic(() => import('@/components/canvas/CanvasArea'), { ssr: false });
const PropertyPanel = dynamic(() => import('@/components/canvas/PropertyPanel'), { ssr: false });

export default function Home() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Toolbar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ServiceSidebar />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <CanvasArea />
            <PropertyPanel />
          </div>
          <AIPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
