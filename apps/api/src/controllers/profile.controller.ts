import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

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
    
    const { user_id, ...updates } = req.body;

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