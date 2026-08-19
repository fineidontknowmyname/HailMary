import { Search } from 'lucide-react';
import { GLASS_CARD_CLASS, glassCardStyle, accentHoverShadow } from '../lib/theme';
import { useAppTheme } from '../lib/ThemeProvider';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedDepth: string | null;
  setSelectedDepth: (depth: string | null) => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedDepth,
  setSelectedDepth
}: FilterBarProps) {
  const { theme } = useAppTheme();

  const types = ['course', 'doc', 'video', 'practice', 'project', 'opensource'];
  const depths = ['surface', 'guided', 'deep', 'foundational'];

  function pillStyle(active: boolean): React.CSSProperties {
    return active
      ? {
          background: theme.accentText,
          color: theme.bgBase,
          fontWeight: 700,
          border: '1px solid transparent',
          ['--chip-hover' as string]: theme.accentText,
        }
      : {
          background: 'transparent',
          color: theme.muted,
          border: `1px solid ${theme.accentBorder}`,
          ['--chip-hover' as string]: theme.accentSoftBg,
        };
  }

  return (
    <div className={`p-4 mb-8 space-y-4 ${GLASS_CARD_CLASS}`} style={glassCardStyle(theme)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.dim }} />
        <input
          type="text"
          placeholder="Search Intel (titles, tags, descriptions)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg pl-10 pr-4 py-3 outline-none transition-all font-mono text-sm"
          style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = accentHoverShadow(theme); e.currentTarget.style.borderColor = theme.accentBorderStrong; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.inputBorder; }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h4 className="text-xs font-mono uppercase mb-2" style={{ color: theme.dim }}>Filter by Format</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType(null)}
              className="px-3 py-1 text-xs font-mono rounded transition-colors hover:bg-[var(--chip-hover)]"
              style={pillStyle(!selectedType)}
            >
              ALL
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="px-3 py-1 text-xs font-mono rounded uppercase transition-colors hover:bg-[var(--chip-hover)]"
                style={pillStyle(selectedType === type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-xs font-mono uppercase mb-2" style={{ color: theme.dim }}>Filter by Depth</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDepth(null)}
              className="px-3 py-1 text-xs font-mono rounded transition-colors hover:bg-[var(--chip-hover)]"
              style={pillStyle(!selectedDepth)}
            >
              ALL
            </button>
            {depths.map(depth => (
              <button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className="px-3 py-1 text-xs font-mono rounded uppercase transition-colors hover:bg-[var(--chip-hover)]"
                style={pillStyle(selectedDepth === depth)}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
