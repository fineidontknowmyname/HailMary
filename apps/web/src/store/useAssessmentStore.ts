import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SafeQuestion {
  id: string;
  section: string;
  question_text: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  company_tags: string[];
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

export type AssessmentStatus = 'idle' | 'loading' | 'in-progress' | 'submitting' | 'completed';

export interface AssessmentState {
  status: AssessmentStatus;
  company: string;
  questions: SafeQuestion[];
  answers: (number | null)[];
  currentQuestionIndex: number;
  timeLeftSeconds: number;
  result: GradedResult | null;
  error: string | null;

  startAssessment: (company: string) => Promise<void>;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  jumpToQuestion: (index: number) => void;
  skipQuestion: () => void;
  tickTimer: () => void;
  submitAssessment: () => Promise<void>;
  resetAssessment: () => void;
}

const EXAM_DURATION_SECONDS = 30 * 60;
const API = import.meta.env.VITE_API_URL;

const initialState = {
  status: 'idle' as AssessmentStatus,
  company: '',
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  timeLeftSeconds: EXAM_DURATION_SECONDS,
  result: null,
  error: null,
};

export const useAssessmentStore = create<AssessmentState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      startAssessment: async (company: string) => {
        set({ status: 'loading', company, error: null });

        try {
          const res = await fetch(
            `${API}/api/assessment/generate?company=${encodeURIComponent(company)}`
          );
          const json = await res.json();

          if (!res.ok || !json.success) {
            throw new Error(json.error ?? 'Failed to load questions.');
          }

          const questions: SafeQuestion[] = json.data;

          set({
            status: 'in-progress',
            questions,
            answers: new Array(questions.length).fill(null),
            currentQuestionIndex: 0,
            timeLeftSeconds: EXAM_DURATION_SECONDS,
            result: null,
          });
        } catch (err: any) {
          set({ status: 'idle', error: err.message });
        }
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

      submitAssessment: async () => {
        const { questions, answers, timeLeftSeconds, company } = get();
        set({ status: 'submitting' });

        const payload = questions.map((q, i) => ({
          questionId: q.id,
          selectedOptionIndex: answers[i] ?? -1,
        }));

        const timeTaken = EXAM_DURATION_SECONDS - timeLeftSeconds;

        try {
          const token = localStorage.getItem('sb-token');
          const res = await fetch(`${API}/api/assessment/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              answers: payload,
              timeTakenSeconds: timeTaken,
              company,
            }),
          });

          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed.');

          set({ status: 'completed', result: json.data });
        } catch (err: any) {
          set({ status: 'idle', error: err.message });
        }
      },

      resetAssessment: () => set(initialState),
    }),
    { name: 'AssessmentStore' }
  )
);
