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
  source: 'feynman' | 'assessment' | null;
  confidence: number | null;
  lastVerifiedAt: string | null;
  lastTestedAt: string | null;
  difficulty: string | null;
  solvedStreak: number;
  hardSkips: number;
  updatedAt: string | null;
}