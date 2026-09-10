import { supabase } from '../lib/supabase';
import type { Intel } from '@hailmary/types';

const DIFFICULTY_RANK: Record<string, number> = {
  beginner: 0,
  easy: 0,
  intermediate: 1,
  medium: 1,
  advanced: 2,
  hard: 2,
};

const DEPTH_RANK: Record<string, number> = {
  surface: 0,
  guided: 1,
  deep: 2,
  foundational: 3,
};

function rank(resource: Intel): number {
  const d = resource.difficulty ? DIFFICULTY_RANK[resource.difficulty.toLowerCase()] : undefined;
  const base = d ?? 1.5;
  const depth = DEPTH_RANK[resource.depth] ?? 1;
  return base * 10 + depth;
}

export const pathsService = {
  seedOrder: async (domain: string, limit = 15): Promise<string[]> => {
    const key = domain.trim().toLowerCase();

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('status', 'approved')
      .overlaps('domains', [key])
      .limit(80);

    if (error) throw new Error(error.message);

    return ((data ?? []) as Intel[])
      .sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title))
      .slice(0, limit)
      .map((r) => r.id);
  },
};
