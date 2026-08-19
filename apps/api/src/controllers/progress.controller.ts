import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

export const ProgressController = {
  getMissionLog: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    
    const { data, error } = await supabase
      .from('user_progress')
      .select('resource_id, completed_at, challenge_completed, feynman_response')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    const mappedData = (data || []).map(row => ({
      userId: user.id,
      intelId: row.resource_id,
      completedAt: row.completed_at,
      challengeCompleted: row.challenge_completed,
      feynmanResponse: row.feynman_response
    }));

    res.status(200).json({ success: true, data: mappedData });
  }),

  markIntelComplete: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const { intelId } = req.body;

    if (!intelId) {
      return res.status(400).json({ success: false, error: 'intelId is required' });
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert({ 
        user_id: user.id, 
        resource_id: intelId, 
        completed_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  }),

  removeIntelProgress: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const { intelId } = req.params;

    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', intelId);

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  })
};