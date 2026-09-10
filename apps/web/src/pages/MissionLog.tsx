import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Target, ShieldCheck, ShieldAlert, Circle } from 'lucide-react';
import type { Intel } from '@hailmary/types';
import { useProgress } from '../hooks/useProgress';
import { useBoundStore } from '../store/useBoundStore';
import { useAppTheme } from '../lib/ThemeProvider';
import { ChallengeModal } from '../components/ChallengeModal';

function relativeAge(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

type Verification = 'verified' | 'unverified' | 'unchecked';

function classify(entry: { challengeCompleted: boolean; verifiedBy?: 'ai' | 'fallback' | null }): Verification {
  if (entry.verifiedBy === 'fallback') return 'unverified';
  if (entry.challengeCompleted) return 'verified';
  return 'unchecked';
}

const STALE_AFTER_DAYS = 21;

function isStale(iso: string): boolean {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return false;
  return Date.now() - then > STALE_AFTER_DAYS * 86_400_000;
}

export default function MissionLog() {
  const { theme } = useAppTheme();
  const { entries, refresh } = useProgress();
  const { intel, fetchIntel } = useBoundStore();
  const [retestIntel, setRetestIntel] = useState<Intel | null>(null);

  useEffect(() => {
    if (intel.length === 0) fetchIntel();
  }, [intel.length, fetchIntel]);

  const intelById = useMemo(() => {
    const map = new Map<string, Intel>();
    intel.forEach((i) => map.set(i.id, i));
    return map;
  }, [intel]);

  const rows = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .map((entry) => ({
        entry,
        resource: intelById.get(entry.intelId) ?? null,
        state: classify(entry),
      }));
  }, [entries, intelById]);

  const badge = (state: Verification, completedAt: string) => {
    if (state === 'unverified') {
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        label: 'Unverified',
        color: '#f59e0b',
        note: 'Grader was offline when this was completed.',
      };
    }
    if (state === 'unchecked') {
      return {
        icon: <Circle className="h-4 w-4" />,
        label: 'Not checked',
        color: theme.muted,
        note: 'Marked done without a Feynman checkpoint.',
      };
    }
    return {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Verified',
      color: theme.accentText,
      note: isStale(completedAt) ? 'Verified a while ago — due for a refresher.' : null,
    };
  };

  return (
    <div className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold" style={{ color: theme.heading }}>
          <Target className="h-8 w-8" style={{ color: theme.accentText }} />
          Mission Log
        </h1>
        <p className="mt-2" style={{ color: theme.muted }}>
          Everything you've completed, and whether your understanding is still verified.
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          className="rounded-lg border py-16 text-center font-mono text-sm"
          style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.muted }}
        >
          No completed missions yet. Finish a study session and verify your understanding to see it here.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(({ entry, resource, state }) => {
            const b = badge(state, entry.completedAt);
            const canRetest = Boolean(resource);
            const emphasise = state === 'unverified' || (state === 'verified' && isStale(entry.completedAt));

            return (
              <li
                key={entry.intelId}
                className="rounded-lg border p-4 sm:p-5"
                style={{
                  background: theme.cardBg,
                  borderColor: emphasise ? b.color : theme.cardBorder,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-bold" style={{ color: theme.heading }}>
                      {resource?.title ?? 'Unknown resource'}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: theme.muted }}>
                      <span
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide"
                        style={{ color: b.color }}
                      >
                        {b.icon}
                        {b.label}
                      </span>
                      <span>completed {relativeAge(entry.completedAt)}</span>
                    </div>
                    {b.note && (
                      <p className="mt-2 text-xs" style={{ color: theme.muted }}>{b.note}</p>
                    )}
                  </div>

                  {canRetest && (
                    <button
                      onClick={() => setRetestIntel(resource)}
                      className="shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                      style={
                        emphasise
                          ? { background: theme.accentText, color: theme.bgBase, borderColor: theme.accentText }
                          : { background: theme.bgBase, color: theme.accentText, borderColor: theme.accentBorder }
                      }
                    >
                      {state === 'verified' ? 'Re-verify' : 'Verify'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {retestIntel && (
          <ChallengeModal
            intel={retestIntel}
            mode="retest"
            onClose={() => setRetestIntel(null)}
            onSuccess={() => refresh()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
