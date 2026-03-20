@AGENTS.md

# Project: CloudSandbox

Interactive AWS architecture learning platform. Users drag-and-drop AWS services onto a ReactFlow canvas, connect them, and get real-time AI feedback from a Gemini-powered tutor.

## Tech stack
- **Framework**: Next.js (App Router) + TypeScript
- **Canvas**: @xyflow/react (ReactFlow)
- **State**: Zustand — `store/canvas.ts` (nodes/edges/history), `store/ai.ts` (chat), `store/scenario.ts` (active learning scenario)
- **AI**: Google Gemini 2.0 Flash via `app/api/chat/route.ts` (streaming)
- **Image export**: html-to-image (`hooks/useExportImage.ts`)

## Key conventions
- All canvas components are `'use client'` — CanvasArea and PropertyPanel use `dynamic(..., { ssr: false })`
- Node IDs use `crypto.randomUUID().slice(0, 8)` — never global counters
- Every state mutation that should be undoable must call `_pushHistory()` first (see `store/canvas.ts`)
- Context menus clamp to viewport with `useLayoutEffect` + `getBoundingClientRect`
- AI context sent to `/api/chat`: `{ messages, architecture: { nodes (with parentId), edges (with label/color) }, scenario }`

## File map
```
app/
  api/chat/route.ts     — Gemini streaming endpoint (system prompt built here)
  page.tsx              — Root layout: ServiceSidebar | Canvas | AIPanel
components/
  canvas/               — CanvasArea, AWSNode, GroupNode, CustomEdge, PropertyPanel,
                          Toolbar, NodeContextMenu, EdgeContextMenu, ShortcutPanel
  sidebar/
    ServiceSidebar.tsx  — "서비스 / 학습" tabbed sidebar; scenario list + checklist
  ai-panel/
    AIPanel.tsx         — Chat UI; sends architecture + active scenario to API
store/
  canvas.ts             — nodes, edges, undo/redo history, snap-to-grid
  ai.ts                 — chat messages, streaming helpers
  scenario.ts           — activeScenario, completedItems checklist
lib/
  aws-services.ts       — AWS service catalogue (id, name, icon, color, defaultConfig)
  scenarios.ts          — 6 learning scenarios with checklist + AI hint
hooks/
  useExportImage.ts     — PNG export via html-to-image
```
