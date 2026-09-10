import type { ProjectStatus } from '../../types/project';

export interface PublicProfile {
  username: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  reddit_url: string | null;
  website_url: string | null;
  leetcode_username: string | null;
  hackerrank_username: string | null;
  portfolio_theme: string | null;
}

export interface PublicProject {
  id: string;
  title: string;
  status: ProjectStatus;
  raw_notes: string | null;
  technical_challenges: string | null;
  metrics: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  created_at: string;
}

export interface PortfolioTemplateProps {
  profile: PublicProfile;
  projects: PublicProject[];
}

export const PORTFOLIO_THEMES = [
  { id: 'editorial', label: 'Editorial', blurb: 'Bold indigo-and-lime magazine layout with a light/dark toggle.' },
  { id: 'minimal', label: 'Minimal', blurb: 'Quiet, typographic, lots of whitespace. Neutral palette.' },
  { id: 'terminal', label: 'Terminal', blurb: 'Monospace dark console aesthetic for backend and systems folks.' },
] as const;

export type PortfolioThemeId = (typeof PORTFOLIO_THEMES)[number]['id'];

export function resolveThemeId(value: string | null | undefined): PortfolioThemeId {
  return PORTFOLIO_THEMES.some((t) => t.id === value) ? (value as PortfolioThemeId) : 'editorial';
}
