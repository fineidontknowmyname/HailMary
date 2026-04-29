import type { Intel } from '@hailmary/types';
import { PlayCircle, FileText, Code, ExternalLink } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';

interface IntelCardProps {
  intel: Intel;
}

export function IntelCard({ intel }: IntelCardProps) {
  const { completed, toggleComplete } = useProgress();
  const isCompleted = completed.has(intel.id);

  const getIcon = () => {
    switch (intel.type) {
      case 'video': return <PlayCircle className="w-5 h-5 text-[#ffc93c]" />;
      case 'opensource': return <Code className="w-5 h-5 text-[#4fffb0]" />;
      case 'doc': return <FileText className="w-5 h-5 text-[#7c6aff]" />;
      default: return <ExternalLink className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div 
      className="flex flex-col justify-between p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-500 transition relative h-full"
    >
      <div>
        <div className="flex items-start gap-4">
          <div className="text-3xl">{getIcon()}</div>
          <div>
            <h3 className="text-lg font-bold text-white">{intel.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{intel.description}</p>
            
            {/* Depth and Understanding Metadata */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <span className="text-xs uppercase tracking-wider text-green-500 font-bold">
                {intel.depth}
              </span>
              <p className="text-sm text-gray-300 mt-1">
                <span className="font-semibold text-gray-500">You will learn: </span>
                {intel.understanding || "Core concepts"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR: Link and Tracking Button */}
      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-800/50">
        
        {/* 1. The Resource Link (Always Unlocked) */}
        <a 
          href={intel.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          Open Resource
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>

        {/* 2. Your Tracking Button Goes Here! */}
        <button 
          onClick={() => toggleComplete(intel.id)}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
            isCompleted
              ? 'text-gray-400 bg-gray-800 hover:bg-gray-700 border border-gray-700'
              : 'text-gray-900 bg-green-500 hover:bg-green-400'
          }`}
        >
          {isCompleted ? 'Completed' : 'Mark In Progress'}
        </button>

      </div>
    </div>
  );
}