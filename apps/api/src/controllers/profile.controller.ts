import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

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
  return updates;
}

export const ProfileController = {
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    res.status(200).json({ success: true, data: data ?? null });
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const updates = pickUpdatableFields(req.body);

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