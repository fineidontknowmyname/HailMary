import { supabase } from '../lib/supabase';
import { Intel } from '@hailmary/types'; // Using our shared monorepo types

export const IntelService = {
  /**
   * Fetches the curated list of Intel.
   * Client-side Fuse.js handles the fuzzy search, so we return the clean dataset here.
   */
  async getCuratedIntel(): Promise<Intel[]> {
    const { data, error } = await supabase
      .from('resources') // Keeping the actual DB table name as 'resources' per the schema
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Intel[];
  },

  /**
   * Generates the proper YouTube URL format based on existing video/playlist IDs.
   * Preserves the Phase 1 decision to redirect rather than embed.
   */
  buildYouTubeUrl(intel: Partial<Intel>): string | null {
    if (intel.video_id) return `https://www.youtube.com/watch?v=${intel.video_id}`;
    if (intel.playlist_id) return `https://www.youtube.com/playlist?list=${intel.playlist_id}`;
    return intel.link || null;
  }
};