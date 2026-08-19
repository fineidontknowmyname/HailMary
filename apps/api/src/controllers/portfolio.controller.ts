import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';
import { dbRowToApiProfile } from '../lib/profileFields';

const PUBLIC_PROFILE_FIELDS =
  'user_id, username, name, location, bio, github_url, linkedin_url, x_url, reddit_url, personal_website, leetcode_username, hackerrank_username';

const PUBLIC_PROJECT_FIELDS =
  'id, title, status, raw_notes, technical_challenges, metrics, tech_stack, github_url, live_url, created_at';

export const PortfolioController = {
  getPublicPortfolio: catchAsync(async (req: Request, res: Response) => {
    const username = req.params.username.trim();

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .eq('username', username)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Portfolio not found' });
    }

    const { data: projects, error: projectsError } = await supabase
      .from('hailmary_projects')
      .select(PUBLIC_PROJECT_FIELDS)
      .eq('user_id', profile.user_id)
      .eq('sync_to_portfolio', true)
      .order('created_at', { ascending: false });

    if (projectsError) throw new Error(projectsError.message);

    const { user_id, ...publicProfile } = dbRowToApiProfile(profile);

    res.status(200).json({
      success: true,
      data: {
        profile: publicProfile,
        projects: projects ?? []
      }
    });
  })
};
