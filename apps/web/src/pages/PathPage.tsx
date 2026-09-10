import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Route, ArrowUp, ArrowDown, X, Play, Trash2 } from 'lucide-react';
import type { Intel, LearningPath } from '@hailmary/types';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { useProgress } from '../hooks/useProgress';
import { useBoundStore } from '../store/useBoundStore';
import { useAppTheme } from '../lib/ThemeProvider';
import SessionManager from '../components/SessionManager';

export default function PathPage() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { completed, entries, refresh } = useProgress();
  const { intel, fetchIntel } = useBoundStore();

  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeResource, setActiveResource] = useState<Intel | null>(null);
  const [newDomain, setNewDomain] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const loadPaths = async () => {
    try {
      const rows = await api.get<LearningPath[]>('/api/paths');
      setPaths(rows);
    } catch {
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (intel.length === 0) fetchIntel();
    loadPaths();
  }, [intel.length, fetchIntel]);

  const intelById = useMemo(() => {
    const m = new Map<string, Intel>();
    intel.forEach((i) => m.set(i.id, i));
    return m;
  }, [intel]);

  const verifiedById = useMemo(() => {
    const m = new Map<string, 'ai' | 'fallback' | null | undefined>();
    entries.forEach((e) => m.set(e.intelId, e.verifiedBy));
    return m;
  }, [entries]);

  const domains = useMemo(() => {
    const set = new Set<string>();
    intel.forEach((i) => (i.domains ?? []).forEach((d) => set.add(d)));
    return [...set].sort();
  }, [intel]);

  const path = paths[0] ?? null;

  const nodes = useMemo(() => {
    if (!path) return [];
    return path.path_order
      .map((id) => intelById.get(id))
      .filter((r): r is Intel => Boolean(r));
  }, [path, intelById]);

  const upNextIndex = nodes.findIndex((n) => !completed.has(n.id));
  const doneCount = nodes.filter((n) => completed.has(n.id)).length;

  const createPath = async () => {
    if (!newDomain.trim()) return;
    setBusy(true);
    try {
      await api.post('/api/paths', { domain: newDomain.trim(), goal: newGoal.trim() || undefined });
      setNewDomain('');
      setNewGoal('');
      await loadPaths();
    } finally {
      setBusy(false);
    }
  };

  const saveOrder = async (order: string[]) => {
    if (!path) return;
    setPaths([{ ...path, path_order: order }, ...paths.slice(1)]);
    try {
      await api.put(`/api/paths/${path.id}`, { path_order: order });
    } catch {
      loadPaths();
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    if (!path) return;
    const order = [...path.path_order];
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    saveOrder(order);
  };

  const removeNode = (id: string) => {
    if (!path) return;
    saveOrder(path.path_order.filter((x) => x !== id));
  };

  const deletePath = async () => {
    if (!path) return;
    setBusy(true);
    try {
      await api.delete(`/api/paths/${path.id}`);
      setPaths([]);
    } finally {
      setBusy(false);
    }
  };

  const nodeStatus = (id: string): { label: string; color: string } => {
    if (!completed.has(id)) return { label: 'Not started', color: theme.muted };
    if (verifiedById.get(id) === 'fallback') return { label: 'Unverified', color: '#f59e0b' };
    return { label: 'Verified', color: theme.accentText };
  };

  return (
    <div className="mx-auto max-w-3xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold" style={{ color: theme.heading }}>
          <Route className="h-8 w-8" style={{ color: theme.accentText }} />
          Learning Path
        </h1>
        <p className="mt-2" style={{ color: theme.muted }}>
          An ordered route through the catalog for one domain. Verify each step to advance.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center font-mono text-sm" style={{ color: theme.muted }}>Loading…</div>
      ) : !path ? (
        <div className="rounded-lg border p-6" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
          <h2 className="text-lg font-bold" style={{ color: theme.heading }}>Start a path</h2>
          <p className="mt-1 mb-4 text-sm" style={{ color: theme.muted }}>
            Pick a domain — the path is seeded from approved resources, easiest first. You can reorder or drop steps after.
          </p>
          <label className="mb-2 block text-xs font-mono uppercase tracking-wide" style={{ color: theme.muted }}>Domain</label>
          <input
            list="path-domains"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. web, dsa, systems"
            className="mb-3 w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
          />
          <datalist id="path-domains">
            {domains.map((d) => <option key={d} value={d} />)}
          </datalist>
          <label className="mb-2 block text-xs font-mono uppercase tracking-wide" style={{ color: theme.muted }}>Goal (optional)</label>
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="e.g. be job-ready for backend roles"
            className="mb-4 w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.heading }}
          />
          <button
            onClick={createPath}
            disabled={busy || !newDomain.trim()}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: theme.accentText, color: theme.bgBase }}
          >
            {busy ? 'Creating…' : 'Create path'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
            <div>
              <div className="text-lg font-bold" style={{ color: theme.heading }}>{path.domain}</div>
              {path.goal && <div className="text-sm" style={{ color: theme.muted }}>{path.goal}</div>}
              <div className="mt-1 text-xs font-mono" style={{ color: theme.accentText }}>
                {doneCount} / {nodes.length} verified
              </div>
            </div>
            <button
              onClick={deletePath}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ borderColor: theme.cardBorder, color: theme.muted }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete path
            </button>
          </div>

          {nodes.length === 0 ? (
            <div className="rounded-lg border py-12 text-center font-mono text-sm" style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.muted }}>
              No steps. The seeded resources may not be in the loaded catalog.
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {nodes.map((node, i) => {
                const st = nodeStatus(node.id);
                const isUpNext = i === upNextIndex;
                return (
                  <li
                    key={node.id}
                    className="rounded-lg border p-4"
                    style={{ background: theme.cardBg, borderColor: isUpNext ? theme.accentBorderStrong : theme.cardBorder }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs" style={{ color: theme.muted }}>{i + 1}</span>
                          {isUpNext && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: theme.accentSoftBg, color: theme.accentText }}>
                              Up next
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 font-bold" style={{ color: theme.heading }}>{node.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs" style={{ color: theme.muted }}>
                          <span className="uppercase tracking-wide">{node.depth}</span>
                          <span style={{ color: st.color }}>{st.label}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1 disabled:opacity-30" style={{ color: theme.muted }}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => move(i, 1)} disabled={i === nodes.length - 1} aria-label="Move down" className="p-1 disabled:opacity-30" style={{ color: theme.muted }}>
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeNode(node.id)} aria-label="Remove step" className="p-1" style={{ color: theme.muted }}>
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setActiveResource(node)}
                          className="ml-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ background: theme.bgBase, borderColor: theme.accentBorder, color: theme.accentText }}
                        >
                          <Play className="h-3.5 w-3.5" /> {completed.has(node.id) ? 'Redo' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}

      <AnimatePresence>
        {activeResource && (
          <SessionManager
            resource={activeResource}
            user={user}
            onClose={() => setActiveResource(null)}
            onVerified={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
