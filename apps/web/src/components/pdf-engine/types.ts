// ─── HailMary PDF Engine — Data Contract ─────────────────────────────────────
// Strict, self-contained interface for any resume template.
// Decoupled from Supabase row shapes so templates never depend on DB schema.

export interface ResumeIdentity {
  fullName: string;
  email: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  cgpa: string;
  startDate: string;
  endDate: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeProject {
  title: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface HailMaryResumeData {
  identity: ResumeIdentity;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
}
