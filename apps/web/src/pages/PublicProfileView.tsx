import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Github, Linkedin, Twitter, Globe, MapPin, ExternalLink,
  Loader2, UserX, Code2, AlertCircle, Sun, Moon,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { InViewFade } from '../components/ui/InViewFade';
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

const INDIGO = '#4B3CE0';
const LIME = '#D4F547';
const INK = '#1E1B4B';

const THEME_STORAGE_KEY = 'hailmary:portfolio-theme';

interface SectionTheme {
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  heading: string;
  body: string;
  bodyMuted: string;
  pillBorder: string;
  pillText: string;
  pillHoverBg: string;
  pillHoverText: string;
  indigoTintBg: string;
  indigoTintText: string;
  limeTintBg: string;
  limeTintText: string;
  notStartedBorder: string;
  notStartedText: string;
  notStartedBg: string;
  dividerBorder: string;
}

const LIGHT_THEME: SectionTheme = {
  pageBg: '#F5F5F5',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E4EF',
  heading: INK,
  body: '#6B7099',
  bodyMuted: '#8A8FA3',
  pillBorder: '#D7D9E4',
  pillText: INK,
  pillHoverBg: INDIGO,
  pillHoverText: '#FFFFFF',
  indigoTintBg: '#F0EEFF',
  indigoTintText: INDIGO,
  limeTintBg: '#FFF9DB',
  limeTintText: '#8A6D00',
  notStartedBorder: '#D7D9E4',
  notStartedText: '#8A8FA3',
  notStartedBg: '#FFFFFF',
  dividerBorder: '#EEF0F7',
};

const DARK_THEME: SectionTheme = {
  pageBg: '#121022',
  cardBg: '#1B1832',
  cardBorder: '#2E2A54',
  heading: '#F1EFFF',
  body: '#B4AFDA',
  bodyMuted: '#8A84B8',
  pillBorder: '#3A3566',
  pillText: '#F1EFFF',
  pillHoverBg: LIME,
  pillHoverText: INK,
  indigoTintBg: 'rgba(75,60,224,0.22)',
  indigoTintText: '#B7ADFF',
  limeTintBg: 'rgba(212,245,71,0.14)',
  limeTintText: LIME,
  notStartedBorder: '#3A3566',
  notStartedText: '#8A84B8',
  notStartedBg: 'transparent',
  dividerBorder: '#2E2A54',
};

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function DotGrid({ className, style, color, cols = 7, rows = 9, gap = 9 }: {
  className?: string; style?: React.CSSProperties; color: string; cols?: number; rows?: number; gap?: number;
}) {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r="1.6" fill={color} />);
    }
  }
  return (
    <svg className={className} style={style} width={cols * gap} height={rows * gap} viewBox={`0 0 ${cols * gap} ${rows * gap}`} aria-hidden="true">
      {dots}
    </svg>
  );
}

function ZigzagIcon({ className, style, color }: { className?: string; style?: React.CSSProperties; color: string }) {
  return (
    <svg className={className} style={style} width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M2 30 L12 30 L12 20 L22 20 L22 10 L32 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SquiggleIcon({ className, style, color }: { className?: string; style?: React.CSSProperties; color: string }) {
  return (
    <svg className={className} style={style} width="48" height="16" viewBox="0 0 48 16" fill="none" aria-hidden="true">
      <path d="M1 8 Q7 1 13 8 T25 8 T37 8 T49 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArcOutline({ className, style, color, size = 340 }: { className?: string; style?: React.CSSProperties; color: string; size?: number }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} stroke={color} strokeWidth="1" />
    </svg>
  );
}

function DiamondColumn({ className, style, color }: { className?: string; style?: React.CSSProperties; color: string }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ''}`} style={style}>
      <div className="h-2.5 w-2.5 border" style={{ borderColor: color }} />
      <div className="h-2.5 w-2.5 rotate-45" style={{ background: color }} />
      <div className="h-2.5 w-2.5 rotate-45" style={{ background: color }} />
      <div className="h-2.5 w-2.5 rotate-45 opacity-50" style={{ background: color }} />
    </div>
  );
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      className="flex h-10 w-10 items-center justify-center rounded-full"
      style={{ background: 'rgba(75,60,224,0.08)' }}
    >
      {dark ? <Sun className="h-4 w-4" style={{ color: INDIGO }} /> : <Moon className="h-4 w-4" style={{ color: INDIGO }} />}
    </motion.button>
  );
}

function SocialPill({ href, icon, label, theme }: { href: string; icon: React.ReactNode; label: string; theme: SectionTheme }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ background: theme.pillHoverBg, color: theme.pillHoverText, borderColor: theme.pillHoverBg, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
      style={{ borderColor: theme.pillBorder, color: theme.pillText, background: 'transparent', fontFamily: 'Manrope, sans-serif' }}
    >
      {icon}
      {label}
    </motion.a>
  );
}

function PlatformBadge({ label, handle, theme }: { label: string; handle: string; theme: SectionTheme }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
      style={{ background: theme.indigoTintBg, color: theme.indigoTintText, fontFamily: 'Manrope, sans-serif' }}
    >
      <Code2 className="h-3.5 w-3.5" />
      {label} · {handle}
    </span>
  );
}

function statusBadgeStyle(status: ProjectStatus, theme: SectionTheme): React.CSSProperties {
  if (status === 'Ongoing') return { background: LIME, color: INK };
  if (status === 'Finished') return { background: INDIGO, color: '#FFFFFF' };
  return { background: theme.notStartedBg, color: theme.notStartedText, border: `1px solid ${theme.notStartedBorder}` };
}

function ProjectTile({ project, theme }: { project: PublicProject; theme: SectionTheme }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col border"
      style={{ borderColor: theme.cardBorder, background: theme.cardBg }}
    >
      <div className="px-6 pt-6 pb-3">
        <span
          className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ ...statusBadgeStyle(project.status, theme), fontFamily: 'Manrope, sans-serif' }}
        >
          {project.status}
        </span>
        <h3
          className="mt-3 text-lg font-bold leading-tight"
          style={{ color: theme.heading, fontFamily: 'Sora, sans-serif' }}
        >
          {project.title}
        </h3>
      </div>

      {project.raw_notes && (
        <p className="px-6 pb-3 text-sm leading-relaxed line-clamp-3" style={{ color: theme.body, fontFamily: 'Manrope, sans-serif' }}>
          {project.raw_notes}
        </p>
      )}

      {project.tech_stack.length > 0 && (
        <div className="px-6 pb-3 flex flex-wrap gap-1.5">
          {project.tech_stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: theme.indigoTintBg, color: theme.indigoTintText, fontFamily: 'Manrope, sans-serif' }}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.metrics && (
        <div className="px-6 pb-3">
          <span className="inline-block text-xs font-semibold px-2.5 py-1" style={{ background: theme.limeTintBg, color: theme.limeTintText, fontFamily: 'Manrope, sans-serif' }}>
            {project.metrics}
          </span>
        </div>
      )}

      {(project.github_url || project.live_url) && (
        <div className="mt-auto px-6 py-4 flex items-center gap-5 border-t" style={{ borderColor: theme.dividerBorder }}>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: theme.heading, fontFamily: 'Manrope, sans-serif' }}
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
              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: INDIGO, fontFamily: 'Manrope, sans-serif' }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Live
            </a>
          )}
        </div>
      )}
    </motion.article>
  );
}

function StatusScreen({ title, message, tone }: { title: string; message: string; tone: 'loading' | 'error' | 'notfound' }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4"
      style={{ background: INDIGO, fontFamily: 'Manrope, sans-serif' }}
    >
      {tone === 'loading' && <Loader2 className="h-8 w-8 animate-spin" style={{ color: LIME }} />}
      {tone === 'error' && <AlertCircle className="h-10 w-10" style={{ color: LIME }} />}
      {tone === 'notfound' && <UserX className="h-10 w-10" style={{ color: LIME }} />}
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h1>
      <p className="text-sm max-w-sm" style={{ color: '#C9C4F0' }}>{message}</p>
      <Link to="/" className="text-sm font-semibold hover:underline" style={{ color: LIME }}>
        ← Back to HailMary
      </Link>
    </div>
  );
}

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const theme = useMemo(() => (dark ? DARK_THEME : LIGHT_THEME), [dark]);

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
    return <StatusScreen tone="loading" title="Loading portfolio…" message="" />;
  }

  if (loadError) {
    return <StatusScreen tone="error" title="Couldn't load this portfolio" message={loadError} />;
  }

  if (notFound || !data) {
    return (
      <StatusScreen
        tone="notfound"
        title={`No portfolio at @${username}`}
        message="This operative hasn't claimed this handle, or hasn't published a portfolio yet."
      />
    );
  }

  const { profile, projects } = data;
  const displayName = profile.name || profile.username;
  const initial = displayName.charAt(0).toUpperCase();
  const socials = [
    profile.github_url && { href: profile.github_url, icon: <Github className="h-4 w-4" />, label: 'GitHub' },
    profile.linkedin_url && { href: profile.linkedin_url, icon: <Linkedin className="h-4 w-4" />, label: 'LinkedIn' },
    profile.twitter_url && { href: profile.twitter_url, icon: <Twitter className="h-4 w-4" />, label: 'Twitter' },
    profile.reddit_url && { href: profile.reddit_url, icon: <Globe className="h-4 w-4" />, label: 'Reddit' },
    profile.website_url && { href: profile.website_url, icon: <Globe className="h-4 w-4" />, label: 'Website' },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      <section
        className="relative overflow-hidden min-h-[600px] sm:min-h-[680px] lg:min-h-[740px] bg-[#4B3CE0] lg:bg-[linear-gradient(to_right,#4B3CE0_0%,#4B3CE0_68%,#D4F547_68%,#D4F547_100%)]"
      >
        <ArcOutline
          className="absolute -left-40 top-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none hidden md:block"
          color="#FFFFFF"
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-10 lg:px-[70px] pt-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="relative inline-flex items-center text-lg sm:text-xl font-bold lowercase" style={{ color: LIME, fontFamily: 'Sora, sans-serif' }}>
              {profile.username}
              <span className="absolute -top-0.5 -right-2.5 h-1.5 w-1.5 rounded-full bg-white" />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
              <Link
                to="/"
                aria-label="Back to HailMary"
                className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full transition-opacity hover:opacity-70"
                style={{ background: 'rgba(75,60,224,0.08)' }}
              >
                <span className="block h-0.5 w-4" style={{ background: INDIGO }} />
                <span className="block h-0.5 w-4" style={{ background: INDIGO }} />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-10 lg:px-[70px] mt-10 lg:mt-16 flex flex-col lg:flex-row lg:items-center gap-12">
          <motion.div
            className="flex-1 min-w-0"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } }}
              className="font-extrabold leading-[0.95] text-white"
              style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(2.25rem, 6vw, 4.25rem)' }}
            >
              <span style={{ color: LIME }}>{displayName}</span>
              <span className="text-white">.</span>
            </motion.h1>

            {profile.bio && (
              <motion.p
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } }}
                className="mt-6 max-w-md text-base sm:text-lg text-white/90 line-clamp-3"
              >
                {profile.bio}
              </motion.p>
            )}

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } } }}
              className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg"
            >
              {profile.location && (
                <div>
                  <p className="flex items-center gap-1.5 text-sm" style={{ color: '#C9C4F0' }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    Based in {profile.location}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm" style={{ color: '#C9C4F0' }}>
                  {projects.length > 0
                    ? `${projects.length} public project${projects.length === 1 ? '' : 's'} shipped through HailMary.`
                    : 'Building in public through HailMary.'}
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative shrink-0 self-center lg:self-auto mx-auto lg:mx-0 lg:mr-4"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="absolute pointer-events-none"
              style={{ top: 14, left: 14, width: '100%', height: '100%', border: '2px solid rgba(255,255,255,0.75)' }}
            />
            <div
              className="relative flex items-center justify-center w-[170px] h-[204px] sm:w-[210px] sm:h-[252px] lg:w-[240px] lg:h-[288px]"
              style={{ background: INK }}
            >
              <span
                className="font-extrabold"
                style={{ color: LIME, fontFamily: 'Sora, sans-serif', fontSize: 'clamp(3.5rem, 8vw, 6rem)', lineHeight: 1 }}
              >
                {initial}
              </span>
            </div>

            <DotGrid
              className="absolute pointer-events-none hidden sm:block"
              style={{ top: -34, right: -34 }}
              color={LIME}
            />
            <ZigzagIcon
              className="absolute pointer-events-none hidden sm:block"
              style={{ bottom: -20, right: -20 }}
              color="#FFFFFF"
            />
            <SquiggleIcon
              className="absolute pointer-events-none hidden sm:block"
              style={{ bottom: -28, left: -34 }}
              color="#FFFFFF"
            />

            <DiamondColumn
              className="absolute pointer-events-none hidden lg:flex"
              style={{ top: 8, right: -48 }}
              color={INDIGO}
            />
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden transition-colors duration-300" style={{ background: theme.pageBg }}>
        <ArcOutline
          className="absolute -bottom-32 -left-32 opacity-[0.15] pointer-events-none hidden md:block"
          color={LIME}
          size={280}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-10 lg:px-[70px] py-14 sm:py-16 space-y-14 sm:space-y-16">

          {(socials.length > 0 || profile.leetcode_username || profile.hackerrank_username) && (
            <InViewFade>
              <div className="flex flex-wrap gap-3">
                {socials.map((s) => <SocialPill key={s.label} {...s} theme={theme} />)}
                {profile.leetcode_username && <PlatformBadge label="LeetCode" handle={profile.leetcode_username} theme={theme} />}
                {profile.hackerrank_username && <PlatformBadge label="HackerRank" handle={profile.hackerrank_username} theme={theme} />}
              </div>
            </InViewFade>
          )}

          <div>
            <InViewFade>
              <h2
                className="text-xs font-bold uppercase tracking-[0.2em] mb-6"
                style={{ color: INDIGO, fontFamily: 'Sora, sans-serif' }}
              >
                Selected Work
              </h2>
            </InViewFade>

            {projects.length === 0 ? (
              <InViewFade>
                <p className="text-sm px-6 py-12 text-center border border-dashed" style={{ color: theme.bodyMuted, borderColor: theme.cardBorder }}>
                  No public projects yet.
                </p>
              </InViewFade>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {projects.map((project, i) => (
                  <InViewFade key={project.id} delay={Math.min(i, 4) * 0.06}>
                    <ProjectTile project={project} theme={theme} />
                  </InViewFade>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
