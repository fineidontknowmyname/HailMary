import { GLASS_CARD_CLASS, glassCardStyle } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

export function SkeletonCard() {
  const { theme } = useAppTheme();
  const pulseStyle = { background: theme.accentSoftBg };

  return (
    <div className={`flex flex-col overflow-hidden animate-pulse ${GLASS_CARD_CLASS}`} style={glassCardStyle(theme)}>
      <div className="aspect-video w-full" style={pulseStyle}></div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full" style={pulseStyle}></div>
          <div className="h-3 w-16 rounded" style={pulseStyle}></div>
        </div>

        <div className="h-5 w-3/4 rounded mb-2" style={pulseStyle}></div>
        <div className="h-5 w-1/2 rounded mb-4" style={pulseStyle}></div>

        <div className="mt-auto flex gap-2">
          <div className="h-6 w-12 rounded" style={pulseStyle}></div>
          <div className="h-6 w-16 rounded" style={pulseStyle}></div>
        </div>
      </div>
    </div>
  );
}
