import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Github, Linkedin, Globe, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile';
import type { HailMaryEducation, HailMaryExperience } from '../types/resume';
import type { HailMaryProject } from '../types/project';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicPortfolioData {
  profile: UserProfile;
  education: HailMaryEducation[];
  experience: HailMaryExperience[];
  projects: HailMaryProject[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicProfileView() {
  const { username: urlUsername } = useParams<{ username: string }>();

  const [data, setData] = useState<PublicPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!urlUsername) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchPublicProfile() {
      setLoading(true);
      setNotFound(false);

      try {
        // 1. Look up the profile by username (no auth required)
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('username', urlUsername)
          .single();

        console.log('[PublicProfileView] Profile query result:', { profileData, profileError });

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userId = profileData.user_id;

        // 2. Fetch education, experience, and projects by the resolved user_id
        const [eduRes, expRes, projRes] = await Promise.all([
          supabase.from('hailmary_education').select('*').eq('user_id', userId).order('start_year', { ascending: false }),
          supabase.from('hailmary_experience').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
          supabase.from('hailmary_projects').select('*').eq('user_id', userId).eq('sync_to_resume', true).order('created_at', { ascending: false }),
        ]);

        setData({
          profile: profileData as UserProfile,
          education: (eduRes.data || []) as HailMaryEducation[],
          experience: (expRes.data || []) as HailMaryExperience[],
          projects: (projRes.data || []) as HailMaryProject[],
        });
      } catch (err) {
        console.error('[PublicProfileView] Fetch error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [urlUsername]);

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
        <p className="text-sm font-mono text-[#7a849a]">Resolving @{urlUsername}…</p>
      </div>
    );
  }

  // ─── 404 State ────────────────────────────────────────────────────────────

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-400/70" />
        <h1 className="text-2xl font-bold text-white">Profile Not Found</h1>
        <p className="text-sm text-[#7a849a] max-w-sm">
          No developer profile exists for <span className="text-white font-mono">@{urlUsername}</span>.
          Double-check the URL or ask them to claim their username.
        </p>
        <a href="/" className="mt-4 text-xs text-[#4fffb0] hover:underline font-mono">
          ← Back to HailMary
        </a>
      </div>
    );
  }

  // ─── Render Portfolio ─────────────────────────────────────────────────────

  const { profile, education, experience, projects } = data;

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* ── Hero Header ── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4fffb0]/8 via-transparent to-purple-500/5" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[#1e222d] border-2 border-[#4fffb0]/30 rounded-full flex items-center justify-center text-4xl font-black text-[#4fffb0] mb-6 shadow-lg shadow-[#4fffb0]/10">
            {(profile.name || profile.username || '?').charAt(0).toUpperCase()}
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            {profile.name || profile.username || 'Developer'}
          </h1>

          {profile.bio && (
            <p className="text-lg text-[#a0aabb] max-w-xl leading-relaxed mb-4">{profile.bio}</p>
          )}

          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-[#7a849a] mb-6">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </div>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap gap-3">
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1e222d] border border-[#2a3040] rounded-lg text-sm text-[#c0c8d8] hover:text-white hover:border-[#4fffb0]/40 transition-all">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1e222d] border border-[#2a3040] rounded-lg text-sm text-[#c0c8d8] hover:text-white hover:border-blue-400/40 transition-all">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1e222d] border border-[#2a3040] rounded-lg text-sm text-[#c0c8d8] hover:text-white hover:border-purple-400/40 transition-all">
                <Globe className="h-4 w-4" /> Website
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Content Sections ── */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-12">

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionHeading title="Experience" />
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id} className="bg-[#13161e] border border-[#1e222d] rounded-xl p-5 hover:border-[#2a3040] transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
                    <h3 className="font-bold text-white">{exp.role}</h3>
                    <span className="text-xs font-mono text-[#4fffb0]">
                      {exp.start_date || '?'} – {exp.end_date || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-[#7a849a] mb-2">{exp.company}</p>
                  {exp.raw_notes && (
                    <div className="text-sm text-[#a0aabb] leading-relaxed whitespace-pre-line">
                      {exp.raw_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section>
            <SectionHeading title="Education" />
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="bg-[#13161e] border border-[#1e222d] rounded-xl p-5 hover:border-[#2a3040] transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-1">
                    <h3 className="font-bold text-white">{edu.degree}</h3>
                    <span className="text-xs font-mono text-[#4fffb0]">
                      {edu.start_year || '?'} – {edu.end_year || 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-[#7a849a]">{edu.institution}</p>
                  {edu.cgpa && (
                    <p className="text-xs text-[#5a6478] mt-1">GPA: {edu.cgpa}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionHeading title="Projects" />
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map(proj => (
                <div key={proj.id} className="bg-[#13161e] border border-[#1e222d] rounded-xl p-5 hover:border-[#2a3040] transition-colors flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white">{proj.title}</h3>
                    <div className="flex gap-1.5 shrink-0">
                      {proj.github_url && (
                        <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-white">
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {proj.live_url && (
                        <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-[#7a849a] hover:text-[#4fffb0]">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {proj.tech_stack.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[#1e222d] border border-[#2a3040] rounded text-[10px] font-mono text-[#7a849a]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.raw_notes && (
                    <p className="text-sm text-[#a0aabb] leading-relaxed line-clamp-3 flex-1">{proj.raw_notes}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-[#1e222d] text-center">
          <p className="text-xs font-mono text-[#3d4558]">
            Built with <a href="/" className="text-[#4fffb0]/60 hover:text-[#4fffb0]">HailMary</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-[#1e222d]" />
    </div>
  );
}
