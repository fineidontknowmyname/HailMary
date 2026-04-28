import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const TUTORIALS = [
  {
    title: 'Git & GitHub',
    desc: 'Survival guide for detached HEADs and root inits',
    href: '/tutorials/git-github.html',
  },
  {
    title: 'Docker',
    desc: 'In the trenches: Volumes, networking, and container crashes',
    href: '/tutorials/docker.html',
  },
  {
    title: 'MongoDB',
    desc: 'Edge cases for aggregation pipelines and indexing',
    href: '/tutorials/mongodb.html',
  },
  {
    title: 'Postman',
    desc: 'Advanced API testing, variables, and auth hacks',
    href: '/tutorials/postman.html',
  },
];

export default function TutorialsAndLabs() {
  return (
    <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <BookOpen className="h-8 w-8 text-green-500" />
            Tutorials & Labs
          </h1>
          <p className="mt-2 text-[#7a849a]">
            Real-world survival guides for developers.
          </p>
        </div>

        <Link
          to="/contribute"
          className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#0b0e14]"
        >
          + Contribute Resource
        </Link>
      </div>

      {/* Directory Grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {TUTORIALS.map((tutorial) => (
          <a
            key={tutorial.title}
            href={tutorial.href}
            className="group flex flex-col justify-between rounded-xl border border-gray-800 bg-[#13161e] p-6 transition-all hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          >
            <div>
              <h2 className="text-xl font-semibold text-white transition-colors group-hover:text-green-400">
                {tutorial.title}
              </h2>
              <p className="mt-2 text-sm text-[#7a849a]">
                {tutorial.desc}
              </p>
            </div>
            
            <div className="mt-6 flex items-center justify-end">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/50 text-gray-400 transition-colors group-hover:bg-green-500/10 group-hover:text-green-400">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
