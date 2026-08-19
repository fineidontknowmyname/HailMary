import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import { aiService } from '../services/aiService';

const router = Router();

router.use(requireAuth);

router.post('/start', async (req, res) => {
  const user_id = (req as any).user.id;
  const { resource_id, planned_minutes } = req.body;

  try {
    const { error: trackError } = await supabase
      .from('user_resources')
      .upsert({
        user_id,
        resource_id,
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id, resource_id' });

    if (trackError) throw trackError;

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

    if (sessionError) throw sessionError;

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Start Session Error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/end', async (req, res) => {
  const user_id = (req as any).user.id;
  const { session_id, actual_minutes, feeling, resource_id } = req.body;

  try {
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

    if (updateError) throw updateError;

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

    res.json({
      success: true,
      isMilestone,
      totalSessions: newSessionCount,
      needsAITutor: feeling === 'stuck'
    });

  } catch (error) {
    console.error('End Session Error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

router.post('/ai-tutor', async (req, res) => {
  const user_id = (req as any).user.id;
  const { resource_id, resource_title, user_message } = req.body;

  try {
    const ai_response = await aiService.tutorSession(resource_title, user_message);

    const { error: insertError } = await supabase
      .from('ai_doubts')
      .insert([{
        user_id,
        resource_id,
        user_message,
        ai_response
      }]);

    if (insertError) throw insertError;

    res.json({ success: true, ai_response });
  } catch (error) {
    console.error('AI Tutor Error:', error);
    res.status(500).json({ error: 'Failed to process AI tutor request' });
  }
});

export default router;
