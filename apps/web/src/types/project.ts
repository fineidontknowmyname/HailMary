// ─── HailMary Project Incubator — Type Definitions ───────────────────────────
// Mirrors the `hailmary_projects` Supabase table exactly.

export type ProjectStatus = 'Not Started' | 'Ongoing' | 'Finished';

export interface HailMaryProject {
  id: string;
  user_id: string;
  title: string;
  status: ProjectStatus;
  raw_notes: string | null;
  technical_challenges: string | null;
  metrics: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  sync_to_portfolio: boolean;
  sync_to_resume: boolean;
  created_at: string;
}

/** Subset used by the Add/Edit modal form — no server-generated fields. */
export type ProjectFormData = Omit<HailMaryProject, 'id' | 'user_id' | 'created_at'>;

export const EMPTY_FORM: ProjectFormData = {
  title: '',
  status: 'Not Started',
  raw_notes: '',
  technical_challenges: '',
  metrics: '',
  tech_stack: [],
  github_url: '',
  live_url: '',
  sync_to_portfolio: false,
  sync_to_resume: true,
};
