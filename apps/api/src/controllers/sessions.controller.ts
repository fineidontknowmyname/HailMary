import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';
import { aiService } from '../services/aiService';
import type { AuthenticatedRequest } from '../types/express';

const MAX_MESSAGE_LENGTH = 1000;

export const SessionsController = {
  start: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user_id = req.user.id;
    const { resource_id, planned_minutes } = req.body;

    const { error: trackError } = await supabase
      .from('user_resources')
      .upsert({
        user_id,
        resource_id,
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id, resource_id' });

    if (trackError) throw new Error(trackError.message);

    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert([{
        user_id,
        resource_id,
        planned_minutes,
        status: 'active'
      }])
      .select()
      .single();

    if (sessionError) throw new Error(sessionError.message);

    res.status(200).json({ success: true, data: { sessionId: session.id } });
  }),

  end: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user_id = req.user.id;
    const { session_id, actual_minutes, feeling, resource_id } = req.body;

    const { error: updateError } = await supabase
      .from('study_sessions')
      .update({
        actual_minutes,
        feeling,
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)
      .eq('user_id', user_id);

    if (updateError) throw new Error(updateError.message);

    const { data: tracker } = await supabase
      .from('user_resources')
      .select('total_sessions, total_minutes_spent')
      .eq('user_id', user_id)
      .eq('resource_id', resource_id)
      .single();

    const newSessionCount = (tracker?.total_sessions || 0) + 1;
    const newTotalMinutes = (tracker?.total_minutes_spent || 0) + actual_minutes;

    await supabase
      .from('user_resources')
      .update({
        total_sessions: newSessionCount,
        total_minutes_spent: newTotalMinutes
      })
      .eq('user_id', user_id)
      .eq('resource_id', resource_id);

    const isMilestone = newSessionCount > 0 && newSessionCount % 5 === 0;

    res.status(200).json({
      success: true,
      data: {
        isMilestone,
        totalSessions: newSessionCount,
        needsAITutor: feeling === 'stuck'
      }
    });
  }),

  aiTutor: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user_id = req.user.id;
    const { resource_id, resource_title, user_message } = req.body;

    if (typeof user_message !== 'string' || !user_message.trim()) {
      return res.status(400).json({ success: false, error: 'user_message is required' });
    }
    if (user_message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ success: false, error: `user_message must be ${MAX_MESSAGE_LENGTH} characters or fewer` });
    }

    const ai_response = await aiService.tutorSession(resource_title, user_message);

    const { error: insertError } = await supabase
      .from('ai_doubts')
      .insert([{
        user_id,
        resource_id,
        user_message,
        ai_response
      }]);

    if (insertError) throw new Error(insertError.message);

    res.status(200).json({ success: true, data: { ai_response } });
  }),
};
