import { supabase } from '../lib/supabase';

const WEAK_SECTION_THRESHOLD = 60;

function normaliseTopics(topics: string[]): string[] {
  return [...new Set(topics.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

async function resourceTopics(resourceId: string): Promise<string[]> {
  const { data } = await supabase
    .from('resources')
    .select('tags, domains')
    .eq('id', resourceId)
    .single();

  return normaliseTopics([...(data?.tags ?? []), ...(data?.domains ?? [])]);
}

export const knowledgeState = {
  resourceTopics,

  recordFeynman: async (
    userId: string,
    topics: string[],
    verifiedBy: 'ai' | 'fallback'
  ): Promise<void> => {
    if (verifiedBy !== 'ai') return;

    const unique = normaliseTopics(topics);
    if (unique.length === 0) return;

    const now = new Date().toISOString();
    const rows = unique.map((topic) => ({
      user_id: userId,
      topic,
      status: 'verified',
      source: 'feynman',
      last_verified_at: now,
      updated_at: now,
    }));

    const { error } = await supabase
      .from('learner_knowledge_state')
      .upsert(rows, { onConflict: 'user_id,topic' });

    if (error) throw new Error(error.message);
  },

  recordAssessmentSections: async (
    userId: string,
    sections: { section: string; score: number }[]
  ): Promise<void> => {
    const now = new Date().toISOString();
    const rows = sections
      .filter((s) => s.section.trim())
      .map((s) => ({
        user_id: userId,
        topic: s.section.trim().toLowerCase(),
        status: s.score >= WEAK_SECTION_THRESHOLD ? 'verified' : 'weak',
        source: 'assessment',
        confidence: s.score,
        last_tested_at: now,
        updated_at: now,
      }));

    if (rows.length === 0) return;

    const { error } = await supabase
      .from('learner_knowledge_state')
      .upsert(rows, { onConflict: 'user_id,topic' });

    if (error) throw new Error(error.message);
  },

  recordStruggle: async (
    userId: string,
    topics: string[],
    misconception: string | null = null
  ): Promise<void> => {
    const unique = normaliseTopics(topics);
    if (unique.length === 0) return;

    const { data: existing } = await supabase
      .from('learner_knowledge_state')
      .select('topic, struggle_count')
      .eq('user_id', userId)
      .in('topic', unique);

    const counts = new Map<string, number>(
      (existing ?? []).map((r) => [r.topic, r.struggle_count ?? 0])
    );

    const now = new Date().toISOString();
    const rows = unique.map((topic) => {
      const row: Record<string, unknown> = {
        user_id: userId,
        topic,
        status: 'weak',
        source: 'struggle',
        last_struggled_at: now,
        struggle_count: (counts.get(topic) ?? 0) + 1,
        updated_at: now,
      };
      if (misconception) row.last_misconception = misconception;
      return row;
    });

    const { error } = await supabase
      .from('learner_knowledge_state')
      .upsert(rows, { onConflict: 'user_id,topic' });

    if (error) throw new Error(error.message);
  },

  listForUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('learner_knowledge_state')
      .select('topic, status, source, confidence, last_verified_at, last_tested_at, last_struggled_at, struggle_count, last_misconception, difficulty, solved_streak, hard_skips, updated_at')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      topic: row.topic,
      status: row.status,
      source: row.source,
      confidence: row.confidence,
      lastVerifiedAt: row.last_verified_at,
      lastTestedAt: row.last_tested_at,
      lastStruggledAt: row.last_struggled_at,
      struggleCount: row.struggle_count ?? 0,
      lastMisconception: row.last_misconception ?? null,
      difficulty: row.difficulty,
      solvedStreak: row.solved_streak,
      hardSkips: row.hard_skips,
      updatedAt: row.updated_at,
    }));
  },

  strugglingTopics: async (userId: string, limit = 8): Promise<string[]> => {
    const { data } = await supabase
      .from('learner_knowledge_state')
      .select('topic, last_struggled_at, last_tested_at, status')
      .eq('user_id', userId)
      .or('source.eq.struggle,status.eq.weak')
      .order('updated_at', { ascending: false })
      .limit(limit);

    return (data ?? []).map((r) => r.topic);
  },
};
