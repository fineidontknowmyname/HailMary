import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

export interface Question {
  id: string;
  section: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  company_tags: string[];
}

export type SafeQuestion = Omit<Question, 'correct_answer_index' | 'explanation'>;

export interface SubmitAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface SectionBreakdown {
  section: string;
  total: number;
  correct: number;
  score: number;
}

export interface GradedResult {
  totalQuestions: number;
  totalCorrect: number;
  percentageScore: number;
  timeTakenSeconds: number;
  sectionBreakdowns: SectionBreakdown[];
  gradedAnswers: GradedAnswer[];
}

export interface GradedAnswer {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
  section: string;
}

export const AssessmentController = {
  generateQuestions: catchAsync(async (req: Request, res: Response) => {
    const company = (req.query.company as string)?.trim();

    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter ?company= is required.',
      });
    }

    const { data, error } = await supabase
      .from('questions')
      .select('id, section, question_text, options, difficulty, company_tags')
      .contains('company_tags', [company])
      .limit(200);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No questions found for company: ${company}`,
      });
    }

    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 50);

    return res.status(200).json({ success: true, data: selected });
  }),

  submitAnswers: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { answers, timeTakenSeconds, company } = req.body as {
      answers: SubmitAnswer[];
      timeTakenSeconds: number;
      company: string;
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'answers array is required and must not be empty.',
      });
    }

    const questionIds = answers.map((a) => a.questionId);

    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, section, question_text, options, correct_answer_index, explanation')
      .in('id', questionIds);

    if (error) throw new Error(error.message);
    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, error: 'Questions not found.' });
    }

    const questionMap = new Map<string, Question>(
      questions.map((q) => [q.id, q as Question])
    );

    const gradedAnswers: GradedAnswer[] = answers.map((answer) => {
      const q = questionMap.get(answer.questionId);
      if (!q) {
        return {
          questionId: answer.questionId,
          questionText: 'Question not found',
          options: [],
          selectedOptionIndex: answer.selectedOptionIndex,
          correctAnswerIndex: -1,
          isCorrect: false,
          explanation: '',
          section: 'unknown',
        };
      }
      return {
        questionId: q.id,
        questionText: q.question_text,
        options: q.options,
        selectedOptionIndex: answer.selectedOptionIndex,
        correctAnswerIndex: q.correct_answer_index,
        isCorrect: answer.selectedOptionIndex === q.correct_answer_index,
        explanation: q.explanation,
        section: q.section,
      };
    });

    const totalCorrect = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = gradedAnswers.length;
    const percentageScore = Math.round((totalCorrect / totalQuestions) * 100);

    const sectionMap = new Map<string, { total: number; correct: number }>();
    for (const a of gradedAnswers) {
      const existing = sectionMap.get(a.section) ?? { total: 0, correct: 0 };
      sectionMap.set(a.section, {
        total: existing.total + 1,
        correct: existing.correct + (a.isCorrect ? 1 : 0),
      });
    }

    const sectionBreakdowns: SectionBreakdown[] = Array.from(sectionMap.entries()).map(
      ([section, stats]) => ({
        section,
        total: stats.total,
        correct: stats.correct,
        score: Math.round((stats.correct / stats.total) * 100),
      })
    );

    if (user) {
      await supabase.from('assessment_results').insert({
        user_id: user.id,
        company,
        total_questions: totalQuestions,
        total_correct: totalCorrect,
        percentage_score: percentageScore,
        time_taken_seconds: timeTakenSeconds,
        section_breakdowns: sectionBreakdowns,
        submitted_at: new Date().toISOString(),
      });
    }

    const result: GradedResult = {
      totalQuestions,
      totalCorrect,
      percentageScore,
      timeTakenSeconds,
      sectionBreakdowns,
      gradedAnswers,
    };

    return res.status(200).json({ success: true, data: result });
  }),
};
