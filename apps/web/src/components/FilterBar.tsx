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

  function pillStyle(active: boolean, accentColor: string, accentContrastColor: string) {
    return active
      ? { background: accentColor, color: accentContrastColor, fontWeight: 700 }
      : { background: theme.cardBg, color: theme.muted, border: `1px solid ${theme.cardBorder}` };
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
              className="px-3 py-1 text-xs font-mono rounded transition-colors"
              style={pillStyle(!selectedType, theme.accentText, theme.bgBase)}
            >
              ALL
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="px-3 py-1 text-xs font-mono rounded uppercase transition-colors"
                style={pillStyle(selectedType === type, theme.accentText, theme.bgBase)}
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
              className="px-3 py-1 text-xs font-mono rounded transition-colors"
              style={pillStyle(!selectedDepth, theme.electricText, '#FFFFFF')}
            >
              ALL
            </button>
            {depths.map(depth => (
              <button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className="px-3 py-1 text-xs font-mono rounded uppercase transition-colors"
                style={pillStyle(selectedDepth === depth, theme.electricText, '#FFFFFF')}
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
