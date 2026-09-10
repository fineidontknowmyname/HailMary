import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';
import { knowledgeState } from '../services/knowledgeState.service';

interface SectionBreakdownInput {
  section: string;
  total: number;
  correct: number;
  score: number;
}

function isSectionBreakdown(value: unknown): value is SectionBreakdownInput {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return typeof s.section === 'string' && typeof s.score === 'number';
}

export const AssessmentsController = {
  submit: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const { variant, score, totalQuestions, timeTakenSeconds, sectionBreakdown } = req.body;

    if (
      typeof score !== 'number' ||
      typeof totalQuestions !== 'number' ||
      typeof timeTakenSeconds !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        error: 'score, totalQuestions and timeTakenSeconds must be numbers',
      });
    }

    const sections: SectionBreakdownInput[] = Array.isArray(sectionBreakdown)
      ? sectionBreakdown.filter(isSectionBreakdown)
      : [];

    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: user.id,
        company_simulated: typeof variant === 'string' ? variant : null,
        score,
        total_questions: totalQuestions,
        time_taken_seconds: timeTakenSeconds,
        section_breakdown: sections,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    await knowledgeState.recordAssessmentSections(
      user.id,
      sections.map((s) => ({ section: s.section, score: s.score }))
    );

    res.status(201).json({ success: true, data: { id: data.id } });
  }),

  history: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;

    const { data, error } = await supabase
      .from('assessment_results')
      .select('id, company_simulated, score, total_questions, time_taken_seconds, section_breakdown, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    const mapped = (data ?? []).map((r) => ({
      id: r.id,
      variant: r.company_simulated,
      score: r.score,
      totalQuestions: r.total_questions,
      timeTakenSeconds: r.time_taken_seconds,
      sectionBreakdown: r.section_breakdown,
      createdAt: r.created_at,
    }));

    res.status(200).json({ success: true, data: mapped });
  }),
};
