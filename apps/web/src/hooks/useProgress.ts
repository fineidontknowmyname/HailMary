import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { api } from '../lib/api';
import type { UserProgress } from '@hailmary/types';

export function useProgress() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<UserProgress[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setCompleted(new Set());
      return;
    }

    try {
      const data = await api.get<UserProgress[]>('/api/progress');
      setEntries(data);
      setCompleted(new Set(data.map(r => r.intelId)));
    } catch (err) {
      console.error('Failed to fetch Mission Log:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  async function toggleComplete(intelId: string) {
    if (!user) return;

    const wasCompleted = completed.has(intelId);

    setCompleted(prev => {
      const next = new Set(prev);
      if (wasCompleted) next.delete(intelId); else next.add(intelId);
      return next;
    });

    try {
      if (wasCompleted) {
        await api.delete(`/api/progress/${intelId}`);
      } else {
        await api.post(`/api/progress`, { intelId });
      }

      fetchProgress();
    } catch (err) {
      console.error('Failed to sync progress to server:', err);

      setCompleted(prev => {
        const next = new Set(prev);
        if (wasCompleted) next.add(intelId); else next.delete(intelId);
        return next;
      });
    }
  }

  return {
    entries,
    completed,
    toggleComplete,
    refresh: fetchProgress,
    isComplete: (id: string) => completed.has(id),
  };
}
