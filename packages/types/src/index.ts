export type DepthLevel = 'surface' | 'guided' | 'deep' | 'foundational';

export interface Intel {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'doc' | 'video' | 'practice' | 'project' | 'roadmap' | 'interview' | 'opensource';
  source: string;
  link: string;
  depth: DepthLevel;
  understanding: string | null;
  tags: string[];
  domains: string[];
  difficulty?: string | null;
  video_id?: string;
  playlist_id?: string;
}

export interface UserProgress {
  userId: string;
  intelId: string;
  completedAt: string;
  challengeCompleted: boolean;
  feynmanResponse?: string;
  verifiedBy?: 'ai' | 'fallback' | null;
}

export interface AssessmentSectionBreakdown {
  section: string;
  total: number;
  correct: number;
  score: number;
}

export interface AssessmentAttempt {
  id: string;
  variant: string | null;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  sectionBreakdown: AssessmentSectionBreakdown[] | null;
  createdAt: string;
}

export interface KnowledgeStateEntry {
  topic: string;
  status: 'verified' | 'weak' | 'decaying' | 'untested' | null;
  source: 'feynman' | 'assessment' | 'struggle' | null;
  confidence: number | null;
  lastVerifiedAt: string | null;
  lastTestedAt: string | null;
  lastStruggledAt: string | null;
  struggleCount: number;
  lastMisconception: string | null;
  difficulty: string | null;
  solvedStreak: number;
  hardSkips: number;
  updatedAt: string | null;
}

export interface SectionRecommendation {
  section: string;
  resources: Intel[];
}

export interface LearningPath {
  id: string;
  user_id: string;
  domain: string;
  language: string | null;
  level: string | null;
  goal: string | null;
  path_order: string[];
  created_at: string;
}

export type NextAction =
  | { kind: 'weak-section'; topic: string; message: string; resourceId: string; resourceTitle: string; resourceLink: string | null }
  | { kind: 'revisit'; message: string; resourceId: string; resourceTitle: string; resourceLink: string | null }
  | { kind: 'none'; message: null };