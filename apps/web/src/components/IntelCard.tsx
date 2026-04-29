import type { Intel } from '@hailmary/types';
import { PlayCircle, FileText, Code, ExternalLink } from 'lucide-react';

interface IntelCardProps {
  intel: Intel;
  onStartSession?: () => void;
}

export function IntelCard({ intel, onStartSession }: IntelCardProps) {

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
      <div className="mt-6 pt-4 border-t border-gray-800/50">
        <button 
          onClick={onStartSession}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
        >
          Start Study Session
        </button>
      </div>
    </div>
  );
}