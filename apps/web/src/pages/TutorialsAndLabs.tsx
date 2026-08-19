import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAppTheme } from '../lib/ThemeProvider';

const TUTORIALS = [
  {
    title: 'Git & GitHub',
    desc: 'Survival guide for detached HEADs and root inits',
    href: '/tutorials/git-guide.html',
  },
  {
    title: 'Docker',
    desc: 'In the trenches: Volumes, networking, and container crashes',
    href: '/tutorials/docker-guide.html',
  },
  {
    title: 'MongoDB',
    desc: 'Edge cases for aggregation pipelines and indexing',
    href: '/tutorials/mongodb-guide.html',
  },
  {
    title: 'Postman',
    desc: 'Advanced API testing, variables, and auth hacks',
    href: '/tutorials/pstman.html',
  },
];

export default function TutorialsAndLabs() {
  const { theme } = useAppTheme();

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold" style={{ color: theme.heading }}>
            <BookOpen className="h-8 w-8" style={{ color: theme.accentText }} />
            Tutorials & Labs
          </h1>
          <p className="mt-2" style={{ color: theme.muted }}>
            Real-world survival guides for developers.
          </p>
        </div>

        <Link
          to="/contribute"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{ background: theme.accentText, color: theme.bgBase }}
        >
          + Contribute Resource
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-4">
          {TUTORIALS.map((tutorial) => (
            <a
              key={tutorial.title}
              href={tutorial.href}
              className="flex items-center justify-between p-6 rounded-lg border transition-all group"
              style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: theme.heading }}>
                  {tutorial.title}
                </h2>
                <p className="text-sm mt-1" style={{ color: theme.muted }}>{tutorial.desc}</p>
              </div>
              <div style={{ color: theme.dim }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
