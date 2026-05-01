import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import { fetchProfile } from '../lib/profile';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';

import { ResumeRenderer } from '../components/pdf-engine/ResumeRenderer';
import { mockResumeData } from '../components/pdf-engine/mockData';
import { ResumeControlPanel } from '../components/ResumeControlPanel';

export default function ResumeBuilder() {
  const { user, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [education, setEducation] = useState<HailMaryEducation[]>([]);
  const [experience, setExperience] = useState<HailMaryExperience[]>([]);
  const [projects, setProjects] = useState<HailMaryProject[]>([]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [profData, eduRes, expRes, projRes] = await Promise.all([
          fetchProfile(user!.id),
          supabase.from('hailmary_education').select('*').eq('user_id', user!.id).order('start_date', { ascending: false }),
          supabase.from('hailmary_experience').select('*').eq('user_id', user!.id).order('start_date', { ascending: false }),
          supabase.from('hailmary_projects').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        ]);

        if (eduRes.error) throw new Error(eduRes.error.message);
        if (expRes.error) throw new Error(expRes.error.message);
        if (projRes.error) throw new Error(projRes.error.message);

        setProfile(profData || { user_id: user!.id });
        setEducation(eduRes.data as HailMaryEducation[]);
        setExperience(expRes.data as HailMaryExperience[]);
        setProjects(projRes.data as HailMaryProject[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load resume data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, isLoggedIn]);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#13161e] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
        <p className="text-sm font-mono text-[#7a849a]">Loading resume engine...</p>
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
      </div>

      {/* ── Right: Live PDF Preview ── */}
      <div className="w-full md:w-1/2 lg:w-[55%] xl:w-[60%] h-full bg-[#0a0c10] flex flex-col relative">
        <div className="absolute top-4 right-6 z-10">
          <div className="bg-[#1e222d]/80 backdrop-blur border border-[#2a3040] rounded-lg px-3 py-1.5 text-xs font-mono text-[#7a849a]">
            Live Preview
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg overflow-hidden">
          <ResumeRenderer data={mockResumeData} />
        </div>
      </div>
    </div>
  );
}
