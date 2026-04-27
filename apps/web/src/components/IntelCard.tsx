import { useState } from 'react';
import type { Intel } from '@hailmary/types';
import { PlayCircle, FileText, Code, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';

interface IntelCardProps {
  intel: Intel;
  isLoggedIn?: boolean;
  isComplete?: boolean;
  onToggle?: () => void;
  onAskDoubt?: () => void;
  onChallenge?: () => void;
}


export function IntelCard({ intel, isLoggedIn, isComplete, onToggle, onAskDoubt, onChallenge }: IntelCardProps) {
  const [imgError, setImgError] = useState(false);

  const thumbnailUrl = intel.video_id 
    ? `https://img.youtube.com/vi/${intel.video_id}/${imgError ? 'hqdefault' : 'maxresdefault'}.jpg`
    : null;

  const getIcon = () => {
    switch (intel.type) {
      case 'video': return <PlayCircle className="w-5 h-5 text-[#ffc93c]" />;
      case 'opensource': return <Code className="w-5 h-5 text-[#4fffb0]" />;
      case 'doc': return <FileText className="w-5 h-5 text-[#7c6aff]" />;
      default: return <ExternalLink className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="group flex flex-col bg-[#161b27] border border-gray-800 rounded-xl overflow-hidden hover:border-[#4fffb0] transition-colors relative">
      <a href={intel.link} target="_blank" rel="noopener noreferrer" className="relative aspect-video w-full overflow-hidden bg-black block">
        {thumbnailUrl ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={intel.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute top-3 right-3 bg-[#0b0e14]/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono font-semibold text-[#4fffb0] uppercase tracking-wider">
              {intel.depth}
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-[#111520] flex items-center justify-center border-b border-gray-800">
             {getIcon()}
          </div>
        )}
      </a>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-xs font-mono text-gray-400 uppercase">{intel.type}</span>
        </div>
        
        <a href={intel.link} target="_blank" rel="noopener noreferrer">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-[#4fffb0] transition-colors">
            {intel.title}
          </h3>
        </a>
        
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
          {intel.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 mb-4">
          {intel.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-[#111520] text-gray-300 text-xs rounded font-mono">
              #{tag}
            </span>
          ))}
        </div>

        {isLoggedIn && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onAskDoubt) onAskDoubt();
              }}
              className="flex items-center gap-1 text-sm font-mono text-[#7c6aff] hover:text-[#9b8cff] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Stuck?
            </button>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (isComplete) {
                  if (onToggle) onToggle();
                } else {
                  if (onChallenge) onChallenge();
                }
              }}
              className={`flex items-center gap-2 text-sm font-mono transition-colors ${isComplete ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
            >
              <CheckCircle className="w-5 h-5" />
              {isComplete ? 'Mission Accomplished' : 'Mark Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}