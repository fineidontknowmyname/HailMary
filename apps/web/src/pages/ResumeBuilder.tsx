import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { fetchProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';

import { ResumeRenderer } from '../components/pdf-engine/ResumeRenderer';
import type { HailMaryResumeData } from '../components/pdf-engine/types';
import { ResumeControlPanel } from '../components/ResumeControlPanel';
import { useAppTheme } from '../lib/ThemeProvider';

type ProfileRow = Partial<UserProfile> & {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  github_link?: string | null;
  linkedin_link?: string | null;
};

type ExperienceRow = HailMaryExperience & {
  bullets?: string[] | null;
  company_name?: string | null;
};

type ProjectRow = HailMaryProject & {
  bullets?: string[] | null;
};

function toBullets(bullets?: string[] | null, rawNotes?: string | null) {
  if (bullets?.length) return bullets.filter(Boolean);
  return rawNotes ? [rawNotes] : [];
}

function mapToResumeData(
  profile: Partial<UserProfile>,
  education: HailMaryEducation[],
  experience: HailMaryExperience[],
  projects: HailMaryProject[],
  fallbackEmail?: string | null
): HailMaryResumeData {
  const profileRow = profile as ProfileRow;

  return {
    identity: {
      fullName: profileRow.full_name || profile.name || profile.username || 'Unknown Developer',
      email: profileRow.email || fallbackEmail || '',
      phone: profileRow.phone || '',
      githubUrl: profileRow.github_link || profile.github_url || '',
      linkedinUrl: profileRow.linkedin_link || profile.linkedin_url || '',
      websiteUrl: profile.website_url || '',
    },
    education: education.map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      cgpa: edu.cgpa || '',
      startDate: edu.start_year || '',
      endDate: edu.end_year || 'Present',
    })),
    experience: experience.map((exp) => {
      const expRow = exp as ExperienceRow;

      return {
        company: expRow.company_name || exp.company,
        role: exp.role,
        startDate: exp.start_year || '',
        endDate: exp.end_year || 'Present',
        bullets: toBullets(expRow.bullets, exp.raw_notes),
      };
    }),
    projects: projects
      .filter((proj) => proj.sync_to_resume)
      .map((proj) => {
        const projRow = proj as ProjectRow;

        return {
          title: proj.title,
          techStack: proj.tech_stack || [],
          githubUrl: proj.github_url || '',
          liveUrl: proj.live_url || '',
          bullets: toBullets(projRow.bullets, proj.raw_notes),
        };
      }),
  };
}

export default function ResumeBuilder() {
  const { theme } = useAppTheme();
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeState, setResumeState] = useState<HailMaryResumeData | null>(null);

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [education, setEducation] = useState<HailMaryEducation[]>([]);
  const [experience, setExperience] = useState<HailMaryExperience[]>([]);
  const [projects, setProjects] = useState<HailMaryProject[]>([]);

  useEffect(() => {
    // Don't run until auth has finished initializing
    if (authLoading) return;

    if (!isLoggedIn || !user) {
      setIsLoading(false);
      return;
    }

    async function fetchLiveResumeData() {
      setIsLoading(true);
      setError(null);

      try {
        const [profData, liveEducation, liveExperience, liveProjects] = await Promise.all([
          fetchProfile(),
          api.get<HailMaryEducation[]>('/api/education'),
          api.get<HailMaryExperience[]>('/api/experience'),
          api.get<HailMaryProject[]>('/api/projects'),
        ]);

        // Debug: verify profile data reaches the component
        console.log('[ResumeBuilder] Fetched Profile:', profData);

        const liveProfile = profData || { user_id: user!.id };

        setProfile(liveProfile);
        setEducation(liveEducation);
        setExperience(liveExperience);
        setProjects(liveProjects);
        setResumeState(mapToResumeData(liveProfile, liveEducation, liveExperience, liveProjects, user!.email));
      } catch (err: any) {
        setError(err.message || 'Failed to load resume data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveResumeData();
  }, [user, isLoggedIn, authLoading]);

  useEffect(() => {
    if (!isLoggedIn || !user || isLoading) return;
    setResumeState(mapToResumeData(profile, education, experience, projects, user.email));
  }, [education, experience, isLoading, isLoggedIn, profile, projects, user]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4" style={{ background: theme.bgBase }}>
        <h1 className="text-2xl font-bold mb-3" style={{ color: theme.heading }}>Resume Builder</h1>
        <p className="text-sm font-mono mb-6 max-w-sm" style={{ color: theme.muted }}>
          Sign in to access the Anti-Slop Resume Engine.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-colors"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          Initialize Session →
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center" style={{ background: theme.bgBase }}>
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm font-mono text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="text-xs underline" style={{ color: theme.muted }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden" style={{ background: theme.bgBase }}>
      <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] h-full overflow-y-auto border-r" style={{ borderColor: theme.cardBorder }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.accentText, borderTopColor: 'transparent' }} />
            <p className="text-xs font-mono animate-pulse" style={{ color: theme.muted }}>Loading profile data…</p>
          </div>
        ) : (
          <ResumeControlPanel
            profile={profile}
            setProfile={setProfile}
            education={education}
            setEducation={setEducation}
            experience={experience}
            setExperience={setExperience}
            projects={projects}
            setProjects={setProjects}
          />
        )}
      </div>

      <div className="w-full md:w-1/2 lg:w-[55%] xl:w-[60%] h-full flex flex-col relative" style={{ background: theme.mode === 'dark' ? '#0a0c10' : '#E5E9F0' }}>
        <div className="absolute top-4 right-6 z-10">
          <div className="backdrop-blur rounded-lg px-3 py-1.5 text-xs font-mono border" style={{ background: theme.headerBg, borderColor: theme.cardBorder, color: theme.muted }}>
            Live Preview
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg overflow-hidden">
          {isLoading || !resumeState ? (
            <div className="flex h-full items-center justify-center text-slate-500 animate-pulse">
              Fetching live profile data...
            </div>
          ) : (
            <ResumeRenderer data={resumeState} />
          )}
        </div>
      </div>
    </div>
  );
}
