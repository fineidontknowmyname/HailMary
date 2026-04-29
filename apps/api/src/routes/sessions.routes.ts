import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { aiService } from '../services/aiService';

const router = Router();

// Initialize Supabase Admin Client
// We use the SERVICE_ROLE_KEY here so the backend can securely write to the DB
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_KEY! 
);

// ==========================================
// 1. START SESSION: The Launch
// ==========================================
router.post('/start', async (req, res) => {
  const { user_id, resource_id, planned_minutes } = req.body;

  try {
    // 1. Ensure a tracking record exists in user_resources (Upsert)
    const { error: trackError } = await supabase
      .from('user_resources')
      .upsert({ 
        user_id, 
        resource_id, 
        last_accessed: new Date().toISOString() 
      }, { onConflict: 'user_id, resource_id' });

    if (trackError) throw trackError;

    // 2. Create the active study session
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

// ==========================================
// 2. END SESSION: The Return & Reflection
// ==========================================
router.post('/end', async (req, res) => {
  const { session_id, actual_minutes, feeling, user_id, resource_id } = req.body;

  try {
    // 1. Update the study_session to completed
    const { error: updateError } = await supabase
      .from('study_sessions')
      .update({
        actual_minutes,
        feeling,
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id);

    if (updateError) throw updateError;

    // 2. Fetch current totals from user_resources
    const { data: tracker } = await supabase
      .from('user_resources')
      .select('total_sessions, total_minutes_spent')
      .eq('user_id', user_id)
      .eq('resource_id', resource_id)
      .single();

    const newSessionCount = (tracker?.total_sessions || 0) + 1;
    const newTotalMinutes = (tracker?.total_minutes_spent || 0) + actual_minutes;

    // 3. Update the global tracking stats
    await supabase
      .from('user_resources')
      .update({
        total_sessions: newSessionCount,
        total_minutes_spent: newTotalMinutes
      })
      .eq('user_id', user_id)
      .eq('resource_id', resource_id);

    // 4. Milestone Logic: Tell the frontend if they hit session 5, 10, or 15
    const isMilestone = newSessionCount > 0 && newSessionCount % 5 === 0;

    res.json({ 
      success: true, 
      isMilestone, 
      totalSessions: newSessionCount,
      needsAITutor: feeling === 'stuck' // If stuck, tell frontend to trigger AI
    });

  } catch (error) {
    console.error('End Session Error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// ==========================================
// 3. AI TUTOR: The Guide
// ==========================================
router.post('/ai-tutor', async (req, res) => {
  const { user_id, resource_id, resource_title, user_message } = req.body;

  try {
    // 1. Get response from AI Service
    const ai_response = await aiService.tutorSession(resource_title, user_message);

    // 2. Save the interaction to Supabase ai_doubts table
    const { error: insertError } = await supabase
      .from('ai_doubts')
      .insert([{
        user_id,
        resource_id,
        user_message,
        ai_response
      }]);

    if (insertError) throw insertError;

    // 3. Return the response
    res.json({ success: true, ai_response });
  } catch (error) {
    console.error('AI Tutor Error:', error);
    res.status(500).json({ error: 'Failed to process AI tutor request' });
  }
});

export default router;
