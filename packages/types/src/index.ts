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