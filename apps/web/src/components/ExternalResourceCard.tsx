import React, { useState } from 'react';
import { ExternalLink, BookOpen, ArrowLeft, ShieldCheck, Rocket } from 'lucide-react';
import { ChallengeModal } from './ChallengeModal';
import type { Intel } from '@hailmary/types';

interface ExternalResourceCardProps {
  intel: Intel;
}

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  course:     { label: 'Course',      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  article:    { label: 'Article',     color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  doc:        { label: 'Doc',         color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  video:      { label: 'Video',       color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  practice:   { label: 'Practice',   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
  project:    { label: 'Project',    color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/30' },
  roadmap:    { label: 'Roadmap',    color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  interview:  { label: 'Interview',  color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/30' },
  opensource: { label: 'Open Source', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
};

export const ExternalResourceCard: React.FC<ExternalResourceCardProps> = ({ intel }) => {
  const [hasLaunched, setHasLaunched]         = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  const openResource = () => {
    window.open(intel.link, '_blank', 'noopener,noreferrer');
  };

  const handleLaunch = () => {
    openResource();
    setHasLaunched(true);
  };

  const handleGoBack = () => {
    openResource();
  };

  const typeMeta = TYPE_META[intel.type] ?? {
    label: intel.type,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/30',
  };

  return (
    <>
      <div className="bg-[#161b27] border border-gray-800 rounded-xl overflow-hidden shadow-lg w-full transition-all duration-300 hover:border-gray-600 hover:shadow-xl hover:shadow-black/30">

        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800 bg-[#111520]">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${typeMeta.bg} ${typeMeta.color}`}
          >
            <BookOpen className="w-3 h-3" />
            {typeMeta.label}
          </span>
          <span className="text-gray-600 text-xs font-mono ml-auto truncate max-w-[220px]">
            {intel.source ?? new URL(intel.link).hostname}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-white tracking-tight mb-2 leading-snug">
            {intel.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            {intel.description}
          </p>

          {!hasLaunched && (
            <button
              onClick={handleLaunch}
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm shadow-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#161b27]"
            >
              <Rocket className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              Launch {typeMeta.label} in New Tab
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {hasLaunched && (
            <div
              style={{ animation: 'fadeSlideIn 0.35s ease forwards' }}
              className="border-t border-gray-800 pt-5"
            >
              <p className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Did you finish the material?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e2535] hover:bg-[#252d40] border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-[#161b27]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back (Still Learning)
                </button>

                <button
                  onClick={() => setIsChallengeOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 active:scale-[0.97] text-white text-sm font-semibold rounded-lg shadow-sm shadow-green-900/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#161b27]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify &amp; Complete
                </button>
              </div>
            </div>
          )}
        </div>

        {intel.tags && intel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            {intel.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#111520] text-gray-500 text-xs rounded font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {isChallengeOpen && (
        <ChallengeModal
          intel={intel}
          onClose={() => setIsChallengeOpen(false)}
          onSuccess={() => setIsChallengeOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default ExternalResourceCard;
