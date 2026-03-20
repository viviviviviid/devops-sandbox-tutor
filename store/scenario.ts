'use client';

import { create } from 'zustand';
import { Scenario } from '@/lib/scenarios';

interface ScenarioStore {
  activeScenario: Scenario | null;
  completedItems: boolean[];
  startScenario: (scenario: Scenario) => void;
  exitScenario: () => void;
  toggleItem: (index: number) => void;
}

export const useScenarioStore = create<ScenarioStore>((set) => ({
  activeScenario: null,
  completedItems: [],

  startScenario: (scenario) =>
    set({
      activeScenario: scenario,
      completedItems: new Array(scenario.checklist.length).fill(false),
    }),

  exitScenario: () =>
    set({ activeScenario: null, completedItems: [] }),

  toggleItem: (index) =>
    set((state) => {
      const next = [...state.completedItems];
      next[index] = !next[index];
      return { completedItems: next };
    }),
}));
