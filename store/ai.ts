'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIStore {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  appendToLastAssistant: (chunk: string) => void;
  setLoading: (v: boolean) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: crypto.randomUUID(), role, content, timestamp: new Date() },
      ],
    })),

  appendToLastAssistant: (chunk) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + chunk };
      }
      return { messages: msgs };
    }),

  setLoading: (v) => set({ isLoading: v }),

  clearMessages: () => set({ messages: [] }),
}));
