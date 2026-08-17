import type { Intel } from '@hailmary/types';
import { PlayCircle, FileText, Code, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

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
    <motion.div
      className="flex flex-col justify-between p-5 bg-gray-900 border border-gray-800 rounded-xl relative h-full cursor-default"
      whileHover={{
        y: -5,
        borderColor: 'rgba(79, 255, 176, 0.5)',
        boxShadow: '0 12px 36px rgba(79, 255, 176, 0.08)',
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      }}
      whileTap={{ scale: 0.985 }}
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
        <motion.button
          onClick={onStartSession}
          className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded-lg transition-colors"
          whileHover={{ backgroundColor: '#22c55e' }}
          whileTap={{ scale: 0.97 }}
        >
          Start Study Session
        </motion.button>
      </div>
    </motion.div>
  );
}
