// Shared types
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  difficulty: Difficulty;
  category: string;
  tags: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  domain: string;
  resources: Resource[];
}

export interface UserProgress {
  userId: string;
  pathId: string;
  resourceId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
}
