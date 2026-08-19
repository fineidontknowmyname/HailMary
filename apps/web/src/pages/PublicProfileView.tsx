import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Github, Linkedin, Twitter, Globe, MapPin, ExternalLink,
  Loader2, UserX, Code2, AlertCircle,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { ProjectStatus } from '../types/project';

interface PublicProfile {
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
}

interface PublicProject {
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

interface PortfolioResponse {
  profile: PublicProfile;
  projects: PublicProject[];
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  'Not Started': 'border-[#3d4558] text-[#7a849a]',
  'Ongoing': 'border-green-500/60 text-green-400',
  'Finished': 'border-blue-500/60 text-blue-400',
};

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono
        bg-[#111520] border border-[#1e2535] text-[#7a849a]
        hover:text-[#4fffb0] hover:border-[#4fffb0]/40 transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

function PlatformBadge({ label, handle }: { label: string; handle: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono
        bg-[#111520] border border-[#1e2535] text-[#7a849a]"
    >
      <Code2 className="h-3 w-3" />
      {label} · {handle}
    </span>
  );
}

function ProjectTile({ project }: { project: PublicProject }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border ${STATUS_STYLES[project.status]}
        bg-[#111520] overflow-hidden`}
    >
      <div className="px-5 pt-5 pb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
            text-[10px] font-mono font-semibold border mb-3 ${STATUS_STYLES[project.status]}`}
        >
          {project.status}
        </span>
        <h3 className="text-base font-bold text-white leading-tight">{project.title}</h3>
      </div>

      {project.raw_notes && (
        <p className="px-5 pb-3 text-xs text-[#7a849a] leading-relaxed font-mono line-clamp-3">
          {project.raw_notes}
        </p>
      )}

      {project.technical_challenges && (
        <p className="px-5 pb-3 text-xs text-[#7a849a]/80 leading-relaxed font-mono line-clamp-2">
          {project.technical_challenges}
        </p>
      )}

      {project.tech_stack.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium
                bg-[#0b0e14] border border-[#252b3b] text-[#4fffb0]"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.metrics && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-400/80
            bg-amber-500/5 border border-amber-500/15 px-2.5 py-1 rounded-lg">
            📈 {project.metrics}
          </span>
        </div>
      )}

      {(project.github_url || project.live_url) && (
        <div className="mt-auto px-5 py-3 flex items-center gap-4 border-t border-[#1a1e2a]">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-mono text-[#7a849a] hover:text-[#4fffb0] transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              Source
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-mono text-[#7a849a] hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    async function loadPortfolio() {
      setLoading(true);
      setNotFound(false);
      setLoadError(null);
      try {
        const result = await api.get<PortfolioResponse>(`/api/portfolio/${username}`);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(err instanceof Error ? err.message : 'Failed to load portfolio');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPortfolio();
    return () => { cancelled = true; };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#4fffb0]" />
        <p className="text-sm font-mono text-[#7a849a]">Loading portfolio…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Couldn't load this portfolio</h1>
        <p className="text-sm font-mono text-red-400 max-w-sm">{loadError}</p>
        <Link to="/" className="text-sm font-mono text-[#4fffb0] hover:underline">
          ← Back to HailMary
        </Link>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111520] border border-[#1e2535]">
          <UserX className="h-8 w-8 text-[#7a849a]" />
        </div>
        <h1 className="text-xl font-bold text-white">No portfolio at @{username}</h1>
        <p className="text-sm font-mono text-[#7a849a] max-w-sm">
          This operative hasn't claimed this handle, or hasn't published a portfolio yet.
        </p>
        <Link to="/" className="text-sm font-mono text-[#4fffb0] hover:underline">
          ← Back to HailMary
        </Link>
      </div>
    );
  }

  const { profile, projects } = data;
  const displayName = profile.name || profile.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <div className="border-b border-[#1e2535]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="font-black text-lg">
            Hail<span className="text-[#4fffb0]">Mary</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        <section className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl
            bg-[#4fffb0]/10 border border-[#4fffb0]/20 text-3xl font-black text-[#4fffb0]">
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white">{displayName}</h1>
            <p className="text-sm font-mono text-[#4fffb0] mt-0.5">@{profile.username}</p>

            {profile.location && (
              <p className="flex items-center gap-1.5 text-xs font-mono text-[#7a849a] mt-2">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </p>
            )}

            {profile.bio && (
              <p className="text-sm text-[#c5cad6] leading-relaxed mt-4 max-w-xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-5">
              {profile.github_url && (
                <SocialLink href={profile.github_url} icon={<Github className="h-3.5 w-3.5" />} label="GitHub" />
              )}
              {profile.linkedin_url && (
                <SocialLink href={profile.linkedin_url} icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
              )}
              {profile.twitter_url && (
                <SocialLink href={profile.twitter_url} icon={<Twitter className="h-3.5 w-3.5" />} label="Twitter" />
              )}
              {profile.reddit_url && (
                <SocialLink href={profile.reddit_url} icon={<Globe className="h-3.5 w-3.5" />} label="Reddit" />
              )}
              {profile.website_url && (
                <SocialLink href={profile.website_url} icon={<Globe className="h-3.5 w-3.5" />} label="Website" />
              )}
            </div>

            {(profile.leetcode_username || profile.hackerrank_username) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.leetcode_username && (
                  <PlatformBadge label="LeetCode" handle={profile.leetcode_username} />
                )}
                {profile.hackerrank_username && (
                  <PlatformBadge label="HackerRank" handle={profile.hackerrank_username} />
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-mono font-bold text-[#4fffb0] uppercase tracking-widest mb-5">
            Projects
          </h2>

          {projects.length === 0 ? (
            <p className="text-sm font-mono text-[#7a849a] border border-dashed border-[#1e2535] rounded-2xl px-6 py-10 text-center">
              No public projects yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((project) => (
                <ProjectTile key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
