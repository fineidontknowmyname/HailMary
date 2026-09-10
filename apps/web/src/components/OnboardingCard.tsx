import { useState } from 'react';
import { X, PlayCircle, BrainCircuit, ShieldCheck } from 'lucide-react';
import { useAppTheme } from '../lib/ThemeProvider';

const STORAGE_KEY = 'hailmary_onboarding_dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

interface OnboardingCardProps {
  completedCount: number;
}

export function OnboardingCard({ completedCount }: OnboardingCardProps) {
  const { theme } = useAppTheme();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || completedCount > 0) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      setDismissed(true);
    }
    setDismissed(true);
  };

  const steps = [
    [PlayCircle, 'Start a study session', 'Pick any resource below and commit to a block of time.'],
    [BrainCircuit, 'Prove you understood it', 'When you finish, choose "I can explain this" and pass the Feynman checkpoint.'],
    [ShieldCheck, 'It becomes a verified completion', 'Verified work shows in your Mission Log and resurfaces when it goes stale.'],
  ] as const;

  return (
    <div
      className="mx-auto mb-8 w-full max-w-3xl rounded-xl border p-5"
      style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold" style={{ color: theme.heading }}>How HailMary works</h2>
          <p className="text-sm" style={{ color: theme.muted }}>
            Completion here means you can explain it — not that you clicked a box.
          </p>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="p-1" style={{ color: theme.muted }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <ol className="flex flex-col gap-3 sm:flex-row">
        {steps.map(([Icon, title, desc], i) => (
          <li key={title} className="flex-1">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0" style={{ color: theme.accentText }} />
              <span className="text-xs font-mono" style={{ color: theme.muted }}>Step {i + 1}</span>
            </div>
            <div className="mt-1 text-sm font-semibold" style={{ color: theme.heading }}>{title}</div>
            <div className="mt-0.5 text-xs" style={{ color: theme.muted }}>{desc}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
