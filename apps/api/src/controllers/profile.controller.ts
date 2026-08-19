import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';
import { apiUpdatesToDbRow, dbRowToApiProfile } from '../lib/profileFields';

const UPDATABLE_PROFILE_FIELDS = [
  'username',
  'name',
  'location',
  'bio',
  'github_url',
  'linkedin_url',
  'twitter_url',
  'reddit_url',
  'website_url',
  'leetcode_username',
  'hackerrank_username',
  'weekly_goal_hours',
  'comfort_zone_score',
  'explored_languages',
] as const;

function pickUpdatableFields(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const field of UPDATABLE_PROFILE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  if (typeof updates.username === 'string') {
    updates.username = updates.username.trim();
  }
  return updates;
}

export const ProfileController = {
  getProfile: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    res.status(200).json({ success: true, data: data ? dbRowToApiProfile(data) : null });
  }),

  updateProfile: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;

    const updates = apiUpdatesToDbRow(pickUpdatableFields(req.body));

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...updates
      });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  })
};