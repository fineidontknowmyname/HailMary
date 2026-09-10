import { Link } from 'react-router-dom';
import { InViewFade } from '../ui/InViewFade';
import type { PortfolioTemplateProps } from './types';

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

export default function MinimalTemplate({ profile, projects }: PortfolioTemplateProps) {
  const displayName = profile.name || profile.username;

  const links = [
    profile.github_url && { href: profile.github_url, label: 'GitHub' },
    profile.linkedin_url && { href: profile.linkedin_url, label: 'LinkedIn' },
    profile.twitter_url && { href: profile.twitter_url, label: 'Twitter' },
    profile.reddit_url && { href: profile.reddit_url, label: 'Reddit' },
    profile.website_url && { href: profile.website_url, label: 'Website' },
    profile.leetcode_username && { href: `https://leetcode.com/${profile.leetcode_username}`, label: 'LeetCode' },
    profile.hackerrank_username && { href: `https://www.hackerrank.com/${profile.hackerrank_username}`, label: 'HackerRank' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div style={{ background: '#FFFFFF', color: '#111111', fontFamily: FONT, minHeight: '100vh' }}>
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <header>
          <Link to="/" className="text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-700">
            ← hailmary
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">{displayName}</h1>
          {profile.location && (
            <p className="mt-1 text-sm text-neutral-500">{profile.location}</p>
          )}
          {profile.bio && (
            <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-neutral-700">{profile.bio}</p>
          )}
          {links.length > 0 && (
            <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-black hover:decoration-black">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </header>

        <section className="mt-16">
          <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-400">Work</h2>
          {projects.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-400">No public projects yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-neutral-200">
              {projects.map((p, i) => (
                <InViewFade key={p.id} delay={Math.min(i, 5) * 0.05}>
                  <li className="py-6 first:pt-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-base font-medium">{p.title}</h3>
                      <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-400">{p.status}</span>
                    </div>
                    {p.raw_notes && (
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-3">{p.raw_notes}</p>
                    )}
                    {p.tech_stack.length > 0 && (
                      <p className="mt-2 text-xs text-neutral-400">{p.tech_stack.join(' · ')}</p>
                    )}
                    {(p.github_url || p.live_url) && (
                      <div className="mt-3 flex gap-4 text-xs">
                        {p.github_url && (
                          <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 underline decoration-neutral-300 underline-offset-2 hover:text-black">
                            Source
                          </a>
                        )}
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-neutral-500 underline decoration-neutral-300 underline-offset-2 hover:text-black">
                            Live
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                </InViewFade>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-20 text-xs text-neutral-300">
          Built with HailMary
        </footer>
      </div>
    </div>
  );
}
