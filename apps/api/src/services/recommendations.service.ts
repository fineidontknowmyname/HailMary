import { supabase } from '../lib/supabase';
import type { Intel } from '@hailmary/types';

const DECAY_AFTER_DAYS = 21;

const SECTION_SYNONYMS: Record<string, string[]> = {
  dp: ['dp', 'dynamic-programming', 'dynamic programming'],
  geo: ['graphs', 'graph', 'geometry', 'trees'],
  greedy: ['greedy', 'algorithms', 'algorithm'],
  math: ['math', 'mathematics', 'number-theory'],
  sim: ['simulation', 'implementation'],
  str: ['strings', 'string'],
  arrays: ['arrays', 'array'],
};

function synonymsFor(section: string): string[] {
  const key = section.trim().toLowerCase();
  return SECTION_SYNONYMS[key] ?? [key];
}

async function resourcesForSection(section: string, limit = 3): Promise<Intel[]> {
  const syn = synonymsFor(section);

  const [byTag, byDomain] = await Promise.all([
    supabase.from('resources').select('*').eq('status', 'approved').overlaps('tags', syn).limit(limit),
    supabase.from('resources').select('*').eq('status', 'approved').overlaps('domains', syn).limit(limit),
  ]);

  const seen = new Map<string, Intel>();
  for (const row of [...(byTag.data ?? []), ...(byDomain.data ?? [])] as Intel[]) {
    if (!seen.has(row.id)) seen.set(row.id, row);
  }
  return [...seen.values()].slice(0, limit);
}

export const recommendationsService = {
  forSections: async (sections: string[]): Promise<{ section: string; resources: Intel[] }[]> => {
    const unique = [...new Set(sections.map((s) => s.trim().toLowerCase()).filter(Boolean))];
    const out: { section: string; resources: Intel[] }[] = [];
    for (const section of unique) {
      const resources = await resourcesForSection(section);
      if (resources.length > 0) out.push({ section, resources });
    }
    return out;
  },

  nextAction: async (userId: string) => {
    const { data: weakRows } = await supabase
      .from('learner_knowledge_state')
      .select('topic, confidence, status, source')
      .eq('user_id', userId)
      .eq('status', 'weak')
      .order('confidence', { ascending: true, nullsFirst: true })
      .limit(5);

    for (const row of weakRows ?? []) {
      const resources = await resourcesForSection(row.topic, 1);
      if (resources.length > 0) {
        const r = resources[0];
        const score = typeof row.confidence === 'number' ? ` (${Math.round(row.confidence)}%)` : '';
        return {
          kind: 'weak-section' as const,
          topic: row.topic,
          message: `Your weakest area is ${row.topic}${score}. Try: ${r.title}`,
          resourceId: r.id,
          resourceTitle: r.title,
          resourceLink: r.link ?? null,
        };
      }
    }

    const cutoff = new Date(Date.now() - DECAY_AFTER_DAYS * 86_400_000).toISOString();
    const { data: staleRows } = await supabase
      .from('user_progress')
      .select('resource_id, completed_at')
      .eq('user_id', userId)
      .eq('challenge_completed', true)
      .eq('verified_by', 'ai')
      .lt('completed_at', cutoff)
      .order('completed_at', { ascending: true })
      .limit(1);

    const stale = staleRows?.[0];
    if (stale) {
      const { data: resource } = await supabase
        .from('resources')
        .select('id, title, link')
        .eq('id', stale.resource_id)
        .single();

      if (resource) {
        const weeks = Math.floor((Date.now() - new Date(stale.completed_at).getTime()) / (7 * 86_400_000));
        return {
          kind: 'revisit' as const,
          message: `Revisit ${resource.title} — verified ${weeks > 0 ? `${weeks} week${weeks === 1 ? '' : 's'}` : 'a while'} ago and due for re-testing`,
          resourceId: resource.id,
          resourceTitle: resource.title,
          resourceLink: resource.link ?? null,
        };
      }
    }

    return { kind: 'none' as const, message: null };
  },
};
