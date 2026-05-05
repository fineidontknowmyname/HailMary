// ─── HailMary Resume Builder — Type Definitions ──────────────────────────────
// Mirrors the hailmary_education and hailmary_experience Supabase tables.

export interface HailMaryEducation {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  cgpa: string | null;
  start_year: string | null; // e.g. "2020"
  end_year: string | null;   // e.g. "2024" or "Present"
}

export interface HailMaryExperience {
  id: string;
  user_id: string;
  company: string;
  role: string;
  raw_notes: string | null;  // bullet-point notes, mined for ATS keywords
  start_date: string | null;
  end_date: string | null;
}

export type EducationFormData = Omit<HailMaryEducation, 'id' | 'user_id'>;
export type ExperienceFormData = Omit<HailMaryExperience, 'id' | 'user_id'>;

export const EMPTY_EDUCATION: EducationFormData = {
  institution: '',
  degree: '',
  cgpa: '',
  start_year: '',
  end_year: '',
};

export const EMPTY_EXPERIENCE: ExperienceFormData = {
  company: '',
  role: '',
  raw_notes: '',
  start_date: '',
  end_date: '',
};

// ─── SQL to create the two tables (run in Supabase SQL Editor) ────────────────
/*
CREATE TABLE public.hailmary_education (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree      TEXT NOT NULL,
  cgpa        TEXT,
  start_year  TEXT,
  end_year    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.hailmary_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own education" ON public.hailmary_education
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.hailmary_experience (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company    TEXT NOT NULL,
  role       TEXT NOT NULL,
  raw_notes  TEXT,
  start_date TEXT,
  end_date   TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.hailmary_experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experience" ON public.hailmary_experience
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/
