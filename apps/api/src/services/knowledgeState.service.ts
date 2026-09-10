import { supabase } from '../lib/supabase';

const WEAK_SECTION_THRESHOLD = 60;

function normaliseTopics(topics: string[]): string[] {
  return [...new Set(topics.map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

export const knowledgeState = {
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

  listForUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('learner_knowledge_state')
      .select('topic, status, source, confidence, last_verified_at, last_tested_at, difficulty, solved_streak, hard_skips, updated_at')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      topic: row.topic,
      status: row.status,
      source: row.source,
      confidence: row.confidence,
      lastVerifiedAt: row.last_verified_at,
      lastTestedAt: row.last_tested_at,
      difficulty: row.difficulty,
      solvedStreak: row.solved_streak,
      hardSkips: row.hard_skips,
      updatedAt: row.updated_at,
    }));
  },
};
