import { Link } from 'react-router-dom';
import { InViewFade } from '../ui/InViewFade';
import type { PortfolioTemplateProps } from './types';

const BG = '#0B0E0C';
const FG = '#C8D3CC';
const DIM = '#5A6B60';
const ACCENT = '#5BE38B';
const AMBER = '#E3B15B';
const FONT = "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace";

export default function TerminalTemplate({ profile, projects }: PortfolioTemplateProps) {
  const displayName = profile.name || profile.username;

  const links = [
    profile.github_url && ['github', profile.github_url],
    profile.linkedin_url && ['linkedin', profile.linkedin_url],
    profile.twitter_url && ['twitter', profile.twitter_url],
    profile.reddit_url && ['reddit', profile.reddit_url],
    profile.website_url && ['website', profile.website_url],
    profile.leetcode_username && ['leetcode', `https://leetcode.com/${profile.leetcode_username}`],
    profile.hackerrank_username && ['hackerrank', `https://www.hackerrank.com/${profile.hackerrank_username}`],
  ].filter(Boolean) as [string, string][];

  return (
    <div style={{ background: BG, color: FG, fontFamily: FONT, minHeight: '100vh' }}>
      <div className="mx-auto max-w-3xl px-5 py-12 text-[13px] leading-relaxed sm:px-8 sm:text-sm">
        <Link to="/" style={{ color: DIM }} className="hover:opacity-80">
          {'<'} back to hailmary
        </Link>

        <div className="mt-8">
          <span style={{ color: ACCENT }}>visitor@hailmary</span>
          <span style={{ color: DIM }}>:</span>
          <span style={{ color: AMBER }}>~/{profile.username}</span>
          <span style={{ color: DIM }}>$</span> whoami
        </div>

        <h1 className="mt-3 text-2xl font-bold sm:text-3xl" style={{ color: '#F2F7F3' }}>{displayName}</h1>
        {profile.location && <p style={{ color: DIM }} className="mt-1"># {profile.location}</p>}
        {profile.bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap">{profile.bio}</p>}

        {links.length > 0 && (
          <div className="mt-8">
            <div>
              <span style={{ color: ACCENT }}>visitor@hailmary</span>
              <span style={{ color: DIM }}>:</span>
              <span style={{ color: AMBER }}>~/{profile.username}</span>
              <span style={{ color: DIM }}>$</span> cat links.txt
            </div>
            <ul className="mt-2">
              {links.map(([label, href]) => (
                <li key={label}>
                  <span style={{ color: DIM }}>{label.padEnd(11, ' ')}</span>
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }} className="hover:underline">
                    {href}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <span style={{ color: ACCENT }}>visitor@hailmary</span>
          <span style={{ color: DIM }}>:</span>
          <span style={{ color: AMBER }}>~/{profile.username}</span>
          <span style={{ color: DIM }}>$</span> ls projects/
        </div>

        {projects.length === 0 ? (
          <p className="mt-2" style={{ color: DIM }}># no public projects yet</p>
        ) : (
          <div className="mt-3 space-y-5">
            {projects.map((p, i) => (
              <InViewFade key={p.id} delay={Math.min(i, 5) * 0.05}>
                <div className="border-l-2 pl-4" style={{ borderColor: DIM }}>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span style={{ color: '#F2F7F3' }} className="font-bold">{p.title}</span>
                    <span style={{ color: AMBER }}>[{p.status.toLowerCase()}]</span>
                  </div>
                  {p.raw_notes && <p className="mt-1 line-clamp-3" style={{ color: FG }}>{p.raw_notes}</p>}
                  {p.tech_stack.length > 0 && (
                    <p className="mt-1" style={{ color: DIM }}># {p.tech_stack.join(' ')}</p>
                  )}
                  {p.metrics && <p className="mt-1" style={{ color: AMBER }}>&gt; {p.metrics}</p>}
                  {(p.github_url || p.live_url) && (
                    <div className="mt-1 flex gap-4">
                      {p.github_url && (
                        <a href={p.github_url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }} className="hover:underline">
                          [source]
                        </a>
                      )}
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noopener noreferrer" style={{ color: ACCENT }} className="hover:underline">
                          [live]
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </InViewFade>
            ))}
          </div>
        )}

        <div className="mt-10" style={{ color: DIM }}>
          <span style={{ color: ACCENT }}>visitor@hailmary</span>
          <span>:</span>
          <span style={{ color: AMBER }}>~/{profile.username}</span>
          <span>$</span> <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
