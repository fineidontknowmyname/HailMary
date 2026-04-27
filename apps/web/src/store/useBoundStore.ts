import { create } from 'zustand';
import { createIntelSlice, type IntelSlice } from './intelSlice';

export const useBoundStore = create<IntelSlice>()((...a) => ({
  ...createIntelSlice(...a),
}));
