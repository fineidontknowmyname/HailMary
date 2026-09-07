import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { mockQuestions, type RawQuestion } from '../data/mockQuestions';
import { codevitaQuestions } from '../data/codevitaQuestions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface AnswerKeyEntry {
  correctAnswerIndex: number;
  explanation: string;
}

export interface SafeQuestion {
  id: string;
  section: string;
  question_text: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  company_tags: string[];
  dataCtx?: string;
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

export type AssessmentStatus = 'idle' | 'in-progress' | 'completed';

export interface AssessmentState {
  status: AssessmentStatus;
  assessmentType: 'mock' | 'codevita' | null;
  questions: SafeQuestion[];
  answerKey: AnswerKeyEntry[];
  answers: (number | null)[];
  currentQuestionIndex: number;
  timeLeftSeconds: number;
  result: GradedResult | null;
  error: string | null;

  startAssessment: (type: 'mock' | 'codevita') => void;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  skipQuestion: () => void;
  tickTimer: () => void;
  submitAssessment: () => void;
  resetAssessment: () => void;
}

const MOCK_DURATION_SECONDS = 30 * 60;
const CODEVITA_DURATION_SECONDS = 45 * 60;

const initialState = {
  status: 'idle' as AssessmentStatus,
  assessmentType: null as 'mock' | 'codevita' | null,
  questions: [],
  answerKey: [],
  answers: [],
  currentQuestionIndex: 0,
  timeLeftSeconds: MOCK_DURATION_SECONDS,
  result: null,
  error: null,
};

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startAssessment: (type: 'mock' | 'codevita') => {
        let rawData: RawQuestion[] = [];
        let time = 0;
        
        if (type === 'mock') {
          rawData = mockQuestions;
          time = MOCK_DURATION_SECONDS;
        } else if (type === 'codevita') {
          rawData = codevitaQuestions;
          time = CODEVITA_DURATION_SECONDS;
        }

        const prepared = shuffle(rawData).map((q: RawQuestion) => {
          const originalOptions = q.options || [];
          const order = shuffle(originalOptions.map((_, idx) => idx));
          return {
            raw: q,
            options: order.map((oi) => originalOptions[oi]),
            correctAnswerIndex: order.indexOf(q.answer),
          };
        });

        const safeQuestions: SafeQuestion[] = prepared.map(({ raw, options }) => ({
          id: String(raw.id),
          section: raw.section || raw.cat || 'general',
          question_text: raw.text || '',
          options,
          difficulty: (raw.diff || 'medium') as 'easy' | 'medium' | 'hard',
          company_tags: [],
          dataCtx: raw.dataCtx,
        }));

        const answerKey: AnswerKeyEntry[] = prepared.map(({ raw, correctAnswerIndex }) => ({
          correctAnswerIndex,
          explanation: raw.explanation || '',
        }));

        set({
          status: 'in-progress',
          assessmentType: type,
          questions: safeQuestions,
          answerKey,
          answers: new Array(safeQuestions.length).fill(null),
          currentQuestionIndex: 0,
          timeLeftSeconds: time,
          result: null,
          error: null,
        });
      },

      selectAnswer: (questionIndex, optionIndex) => {
        set((state) => {
          const next = [...state.answers];
          next[questionIndex] = optionIndex;
          return { answers: next };
        });
      },

      nextQuestion: () => {
        set((state) => {
          const next = Math.min(
            state.currentQuestionIndex + 1,
            state.questions.length - 1
          );
          return { currentQuestionIndex: next };
        });
      },

      prevQuestion: () => {
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        }));
      },

      jumpToQuestion: (index) => {
        set((state) => {
          if (index < 0 || index >= state.questions.length) return {};
          return { currentQuestionIndex: index };
        });
      },

      skipQuestion: () => {
        const { nextQuestion, selectAnswer, currentQuestionIndex, answers } = get();
        if (answers[currentQuestionIndex] === null) {
          selectAnswer(currentQuestionIndex, -1);
        }
        nextQuestion();
      },

      tickTimer: () => {
        set((state) => {
          if (state.timeLeftSeconds <= 1) {
            get().submitAssessment();
            return { timeLeftSeconds: 0 };
          }
          return { timeLeftSeconds: state.timeLeftSeconds - 1 };
        });
      },

      submitAssessment: () => {
        const { questions, answerKey, answers, timeLeftSeconds, assessmentType } = get();

        const totalTime = assessmentType === 'mock' ? MOCK_DURATION_SECONDS : CODEVITA_DURATION_SECONDS;
        const timeTakenSeconds = totalTime - timeLeftSeconds;

        let totalCorrect = 0;
        const sectionMap = new Map<string, { total: number; correct: number }>();
        const gradedAnswers: GradedAnswer[] = [];

        questions.forEach((q, i) => {
          const key = answerKey[i];
          const correctAnswerIndex = key ? key.correctAnswerIndex : -1;
          const explanation = key ? key.explanation : '';
          const selectedOptionIndex = answers[i] ?? -1;
          const isCorrect = selectedOptionIndex !== -1 && selectedOptionIndex === correctAnswerIndex;

          if (isCorrect) totalCorrect++;

          gradedAnswers.push({
            questionId: q.id,
            questionText: q.question_text,
            options: q.options,
            selectedOptionIndex,
            correctAnswerIndex,
            isCorrect,
            explanation,
            section: q.section,
          });

          const existing = sectionMap.get(q.section) || { total: 0, correct: 0 };
          sectionMap.set(q.section, {
            total: existing.total + 1,
            correct: existing.correct + (isCorrect ? 1 : 0)
          });
        });

        const totalQuestions = questions.length;
        const percentageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        const sectionBreakdowns: SectionBreakdown[] = Array.from(sectionMap.entries()).map(
          ([section, stats]) => ({
            section,
            total: stats.total,
            correct: stats.correct,
            score: Math.round((stats.correct / stats.total) * 100),
          })
        );

        const result: GradedResult = {
          totalQuestions,
          totalCorrect,
          percentageScore,
          timeTakenSeconds,
          sectionBreakdowns,
          gradedAnswers,
        };

        set({ status: 'completed', result });
      },

      resetAssessment: () => set(initialState),
    }),
    { name: 'AssessmentStore' }
  )
);
