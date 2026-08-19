import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

const EDUCATION_FIELDS = ['institution', 'degree', 'cgpa', 'start_year', 'end_year'] as const;

function pickEducationFields(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const field of EDUCATION_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  return updates;
}

export const EducationController = {
  list: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;

    const { data, error } = await supabase
      .from('hailmary_education')
      .select('*')
      .eq('user_id', user.id)
      .order('start_year', { ascending: false });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true, data: data ?? [] });
  }),

  create: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const user = req.user;
    const fields = pickEducationFields(req.body);

    if (!fields.institution || !fields.degree) {
      return res.status(400).json({ success: false, error: 'Institution and Degree are required.' });
    }

    const { data, error } = await supabase
      .from('hailmary_education')
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
      .from('hailmary_education')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  }),
};
