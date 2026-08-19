import type { StateCreator } from 'zustand';
import type { Intel } from '@hailmary/types';
import { api } from '../lib/api';

export interface IntelSlice {
  intel: Intel[];
  isLoading: boolean;
  error: string | null;
  fetchIntel: () => Promise<void>;
}

export const createIntelSlice: StateCreator<IntelSlice> = (set) => ({
  intel: [],
  isLoading: false,
  error: null,
  fetchIntel: async () => {
    set({ isLoading: true, error: null });
    try {
      // Hits our optimized Express route: GET /api/intel
      const data = await api.get<Intel[]>('/api/intel'); 
      set({ intel: data, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },
});