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
      // Map the array into a Set for O(1) lookups in the UI
      setCompleted(new Set(data.map(r => r.intelId)));
    } catch (err) {
      console.error('Failed to fetch Mission Log:', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  async function toggleComplete(intelId: string) {
    if (!user) return;

    const wasCompleted = completed.has(intelId);

    setCompleted(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(intelId) : next.add(intelId);
      return next;
    });

    // Server Request
    try {
      if (wasCompleted) {
        await api.delete(`/api/progress/${intelId}`);
      } else {
        await api.post(`/api/progress`, { intelId });
      }
      
      // Silently refresh the full entry list in the background to ensure sync
      fetchProgress();
    } catch (err) {
      console.error('Failed to sync progress to server:', err);
      
      // Revert the optimistic update if the server request failed
      setCompleted(prev => {
        const next = new Set(prev);
        wasCompleted ? next.add(intelId) : next.delete(intelId);
        return next;
      });
    }
  }

  return {
    completed,
    toggleComplete,
    isComplete: (id: string) => completed.has(id), // Drop-in compatibility with existing components
  };
}