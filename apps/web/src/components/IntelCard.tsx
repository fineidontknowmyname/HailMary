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
    <a 
      href={intel.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-500 transition"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{getIcon()}</div>
        <div>
          <h3 className="text-lg font-bold text-white">{intel.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{intel.description}</p>
          
          {/* Render the new 'depth' and 'understanding' metadata */}
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
    </a>
  );
}