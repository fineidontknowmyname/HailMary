import type { Intel } from '@hailmary/types';
import { PlayCircle, FileText, Code, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { GLASS_CARD_CLASS, glassCardStyle, accentHoverShadow } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

interface IntelCardProps {
  intel: Intel;
  onStartSession?: () => void;
}

export function IntelCard({ intel, onStartSession }: IntelCardProps) {
  const { theme } = useAppTheme();

  const getIcon = () => {
    switch (intel.type) {
      case 'video': return <PlayCircle className="w-5 h-5 text-[#ffc93c]" />;
      case 'opensource': return <Code className="w-5 h-5" style={{ color: theme.accentText }} />;
      case 'doc': return <FileText className="w-5 h-5" style={{ color: theme.electricText }} />;
      default: return <ExternalLink className="w-5 h-5" style={{ color: theme.muted }} />;
    }
  };

  return (
    <motion.div
      className={`flex flex-col justify-between p-5 h-full cursor-default ${GLASS_CARD_CLASS}`}
      style={glassCardStyle(theme)}
      whileHover={{
        y: -4,
        borderColor: theme.accentBorderStrong,
        boxShadow: accentHoverShadow(theme),
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      }}
      whileTap={{ scale: 0.985 }}
    >
      <div>
        <div className="flex items-start gap-4">
          <div className="text-3xl">{getIcon()}</div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: theme.heading }}>{intel.title}</h3>
            <p className="text-sm mt-1" style={{ color: theme.muted }}>{intel.description}</p>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: theme.accentText }}>
                {intel.depth}
              </span>
              <p className="text-sm mt-1" style={{ color: theme.body }}>
                <span className="font-semibold" style={{ color: theme.muted }}>You will learn: </span>
                {intel.understanding || "Core concepts"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
        <motion.button
          onClick={onStartSession}
          className="w-full px-4 py-2 rounded-lg border font-bold transition-colors"
          style={{ background: theme.bgBase, borderColor: theme.accentText, color: theme.accentText }}
          whileHover={{ boxShadow: accentHoverShadow(theme) }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          Start Study Session
        </motion.button>
      </div>
    </motion.div>
  );
}
