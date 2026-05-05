import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { fetchProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';

import { ResumeRenderer } from '../components/pdf-engine/ResumeRenderer';
import type { HailMaryResumeData } from '../components/pdf-engine/types';
import { ResumeControlPanel } from '../components/ResumeControlPanel';

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
        const [profData, eduRes, expRes, projRes] = await Promise.all([
          fetchProfile(user!.id),
          supabase.from('hailmary_education').select('*').eq('user_id', user!.id).order('start_year', { ascending: false }),
          supabase.from('hailmary_experience').select('*').eq('user_id', user!.id).order('start_year', { ascending: false }),
          supabase.from('hailmary_projects').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        ]);

        if (eduRes.error) throw new Error(eduRes.error.message);
        if (expRes.error) throw new Error(expRes.error.message);
        if (projRes.error) throw new Error(projRes.error.message);

        // Debug: verify profile data reaches the component
        console.log('[ResumeBuilder] Fetched Profile:', profData);

        const liveProfile = profData || { user_id: user!.id };
        const liveEducation = (eduRes.data || []) as HailMaryEducation[];
        const liveExperience = (expRes.data || []) as HailMaryExperience[];
        const liveProjects = (projRes.data || []) as HailMaryProject[];

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
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-3">Resume Builder</h1>
        <p className="text-sm font-mono text-[#7a849a] mb-6 max-w-sm">
          Sign in to access the Anti-Slop Resume Engine.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
          className="px-6 py-3 rounded-xl text-sm font-bold bg-[#4fffb0] text-[#0b0e14]"
        >
          Initialize Session →
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#13161e] gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm font-mono text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="text-xs text-[#7a849a] underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#13161e] overflow-hidden">
      {/* ── Left: Control Panel ── */}
      <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] h-full overflow-y-auto border-r border-[#1e222d]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="h-8 w-8 border-2 border-[#4fffb0] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-[#7a849a] animate-pulse">Loading profile data…</p>
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

      {/* ── Right: Live PDF Preview ── */}
      <div className="w-full md:w-1/2 lg:w-[55%] xl:w-[60%] h-full bg-[#0a0c10] flex flex-col relative">
        <div className="absolute top-4 right-6 z-10">
          <div className="bg-[#1e222d]/80 backdrop-blur border border-[#2a3040] rounded-lg px-3 py-1.5 text-xs font-mono text-[#7a849a]">
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
