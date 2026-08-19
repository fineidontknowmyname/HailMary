import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

const EXPERIENCE_FIELDS = ['company', 'role', 'raw_notes', 'start_year', 'end_year'] as const;

function pickExperienceFields(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const field of EXPERIENCE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  return updates;
}

export const ExperienceController = {
  list: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;

    const { data, error } = await supabase
      .from('hailmary_experience')
      .select('*')
      .eq('user_id', user.id)
      .order('start_year', { ascending: false });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true, data: data ?? [] });
  }),

  create: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const fields = pickExperienceFields(req.body);

    if (!fields.company || !fields.role) {
      return res.status(400).json({ success: false, error: 'Company and Role are required.' });
    }

    const { data, error } = await supabase
      .from('hailmary_experience')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  }),

  remove: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    const { error } = await supabase
      .from('hailmary_experience')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  }),
};
