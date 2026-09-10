import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import type { Intel, NextAction as NextActionData } from '@hailmary/types';
import { api } from '../lib/api';
import { useBoundStore } from '../store/useBoundStore';
import { useAppTheme } from '../lib/ThemeProvider';

interface NextActionProps {
  onStartResource: (resource: Intel) => void;
}

export function NextAction({ onStartResource }: NextActionProps) {
  const { theme } = useAppTheme();
  const navigate = useNavigate();
  const intel = useBoundStore((s) => s.intel);
  const [action, setAction] = useState<NextActionData | null>(null);

  useEffect(() => {
    let active = true;
    api.get<NextActionData>('/api/recommendations/next-action')
      .then((data) => { if (active) setAction(data); })
      .catch(() => setAction(null));
    return () => { active = false; };
  }, []);

  if (!action || action.kind === 'none') return null;

  const handleClick = () => {
    if (action.kind === 'revisit') {
      navigate('/missions');
      return;
    }
    const match = intel.find((i) => i.id === action.resourceId);
    if (match) {
      onStartResource(match);
    } else if (action.resourceLink) {
      window.open(action.resourceLink, '_blank', 'noopener');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mx-auto mb-8 flex w-full max-w-3xl items-center gap-3 rounded-xl border px-5 py-3 text-left transition-colors"
      style={{ background: theme.accentSoftBg, borderColor: theme.accentBorder, color: theme.heading }}
    >
      <Compass className="h-5 w-5 shrink-0" style={{ color: theme.accentText }} />
      <span className="min-w-0 flex-1 text-sm">
        <span className="font-mono text-xs uppercase tracking-wide" style={{ color: theme.accentText }}>
          Next
        </span>
        <span className="mt-0.5 block">{action.message}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0" style={{ color: theme.accentText }} />
    </button>
  );
}
