import { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, Globe, AlertCircle, Loader2, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/useAuth';
import type { UserProfile } from '../types/profile';
import type { HailMaryProject } from '../types/project';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';

// ─── Sub-Components ───────────────────────────────────────────────────────────

function HeroSection({ profile }: { profile: Partial<UserProfile> }) {
  return (
    <div className="py-20 text-center border-b border-[#1e222d] mb-12">
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
        {profile.name || profile.username || 'Anonymous Developer'}
      </h1>
      
      {profile.bio && (
        <p className="text-lg text-[#7a849a] max-w-2xl mx-auto mb-8 font-mono leading-relaxed">
          {profile.bio}
        </p>
      )}

      <div className="flex items-center justify-center gap-6">
        {profile.github_url && (
          <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-[#4fffb0] transition-colors p-2 bg-[#1e222d] rounded-full border border-[#2a3040] hover:border-[#4fffb0]/50 hover:shadow-[0_0_15px_rgba(79,255,176,0.2)]">
            <Github className="h-5 w-5" />
          </a>
        )}
        {profile.linkedin_url && (
          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-blue-400 transition-colors p-2 bg-[#1e222d] rounded-full border border-[#2a3040] hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Linkedin className="h-5 w-5" />
          </a>
        )}
        {profile.twitter_url && (
          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-sky-400 transition-colors p-2 bg-[#1e222d] rounded-full border border-[#2a3040] hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Twitter className="h-5 w-5" />
          </a>
        )}
        {/* Skipping Reddit since the icon might not exist in lucide out of the box, or using Globe as fallback */}
        {profile.reddit_url && (
          <a href={profile.reddit_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-orange-500 transition-colors p-2 bg-[#1e222d] rounded-full border border-[#2a3040] hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Link2 className="h-5 w-5" />
          </a>
        )}
        {profile.website_url && (
          <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-purple-400 transition-colors p-2 bg-[#1e222d] rounded-full border border-[#2a3040] hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Globe className="h-5 w-5" />
          </a>
        )}
      </div>
    </div>
  );
}

function PublicProjectGrid({ projects }: { projects: HailMaryProject[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mb-20">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-[#4fffb0] font-mono text-sm uppercase tracking-widest bg-[#4fffb0]/10 px-3 py-1 rounded-full border border-[#4fffb0]/20">Featured Projects</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(projects || []).map((project) => (
          <div key={project.id} className={`flex flex-col bg-[#1e222d] border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
            project.status === 'Ongoing' ? 'border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]' :
            project.status === 'Finished' ? 'border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' :
            'border-[#2a3040]'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
              <div className="flex gap-2">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-white transition-colors" title="GitHub">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-[#4fffb0] transition-colors" title="Live Preview">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
            
            <p className="text-sm text-[#7a849a] font-mono leading-relaxed mb-6 flex-grow">
              {project.raw_notes || 'No description provided.'}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {(project.tech_stack || []).map(tech => (
                <span key={tech} className="px-2.5 py-1 text-[11px] font-mono font-medium text-white bg-[#13161e] border border-[#2a3040] rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceTimeline({ experience, education }: { experience: HailMaryExperience[], education: HailMaryEducation[] }) {
  if ((experience || []).length === 0 && (education || []).length === 0) return null;

  // We map them to a unified timeline structure for simplicity, or render two separate timelines.
  // The instructions said "A vertical timeline layout combining both... or side-by-side". Combining is requested: "combining both"
  const timelineItems = [
    ...(experience || []).map(e => ({ type: 'exp', id: e.id, title: e.role, org: e.company, start: e.start_date, end: e.end_date, notes: e.raw_notes })),
    ...(education || []).map(e => ({ type: 'edu', id: e.id, title: e.degree, org: e.institution, start: e.start_date, end: e.end_date, notes: null }))
  ].sort((a, b) => {
    // Sort descending by start date, assuming "YYYY-MM" format.
    const dateA = a.start || '0000-00';
    const dateB = b.start || '0000-00';
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="mb-20">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-[#4fffb0] font-mono text-sm uppercase tracking-widest bg-[#4fffb0]/10 px-3 py-1 rounded-full border border-[#4fffb0]/20">Journey</span>
      </h2>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#2a3040] before:to-transparent">
        {timelineItems.map((item, idx) => (
          <div key={item.id + idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#13161e] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow
              ${item.type === 'exp' ? 'bg-[#4fffb0]' : 'bg-purple-500'}`}
            ></div>
            
            {/* Content card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e222d] border border-[#2a3040] rounded-xl p-6">
              <div className="flex flex-col mb-2">
                <span className="text-xs font-mono text-[#7a849a] mb-1">{item.start || '?'} — {item.end || 'Present'}</span>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <span className={`text-sm font-mono mt-1 ${item.type === 'exp' ? 'text-[#4fffb0]' : 'text-purple-400'}`}>{item.org}</span>
              </div>
              
              {item.notes && (
                <div className="text-sm text-[#7a849a] font-mono mt-4 leading-relaxed whitespace-pre-line">
                  {item.notes.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[#2a3040]">•</span>
                      <span>{line.replace(/^[-•*]\s*/, '').trim()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { user, isLoggedIn } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [projects, setProjects] = useState<HailMaryProject[]>([]);
  const [experience, setExperience] = useState<HailMaryExperience[]>([]);
  const [education, setEducation] = useState<HailMaryEducation[]>([]);

  useEffect(() => {
    // For now, defaulting to the authenticated user. In a real public setup, 
    // we would extract a user ID or slug from the route parameters.
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    async function loadPortfolio() {
      setLoading(true);
      setError(null);

      try {
        const [profRes, projRes, expRes, eduRes] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', user!.id).single(),
          supabase.from('hailmary_projects').select('*').eq('user_id', user!.id).eq('sync_to_portfolio', true).order('created_at', { ascending: false }),
          supabase.from('hailmary_experience').select('*').eq('user_id', user!.id).order('start_date', { ascending: false }),
          supabase.from('hailmary_education').select('*').eq('user_id', user!.id).order('start_date', { ascending: false })
        ]);

        if (profRes.error && profRes.error.code !== 'PGRST116') throw new Error(profRes.error.message); // PGRST116 is no rows
        if (projRes.error) throw new Error(projRes.error.message);
        if (expRes.error) throw new Error(expRes.error.message);
        if (eduRes.error) throw new Error(eduRes.error.message);

        setProfile(profRes.data || {});
        setProjects((projRes.data || []) as HailMaryProject[]);
        setExperience((expRes.data || []) as HailMaryExperience[]);
        setEducation((eduRes.data || []) as HailMaryEducation[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [user, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white mb-3">Public Portfolio</h1>
        <p className="text-sm font-mono text-[#7a849a] mb-6 max-w-sm">
          Sign in to preview your public developer portfolio.
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
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
        <p className="text-sm font-mono text-[#7a849a]">Assembling Portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#13161e] flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-mono text-red-400 max-w-md">{error || 'Profile not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13161e] text-white overflow-x-hidden selection:bg-[#4fffb0]/30 selection:text-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-32">
        <HeroSection profile={profile} />
        <PublicProjectGrid projects={projects} />
        <ExperienceTimeline experience={experience} education={education} />
      </div>
    </div>
  );
}
