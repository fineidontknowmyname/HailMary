import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

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
    href: '/tutorials/mongodb.html',
  },
  {
    title: 'Postman',
    desc: 'Advanced API testing, variables, and auth hacks',
    href: '/tutorials/pstman.html',
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
        <div className="space-y-4">
          {TUTORIALS.map((tutorial) => (
            <a 
              key={tutorial.title}
              href={tutorial.href} 
              className="flex items-center justify-between p-6 bg-[#13161e] border border-gray-800 rounded-lg hover:border-green-500 transition-all group"
            >
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-green-400">
                  {tutorial.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{tutorial.desc}</p>
              </div>
              <div className="text-gray-600 group-hover:text-green-500">
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
