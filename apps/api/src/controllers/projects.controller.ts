import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';

const PROJECT_FIELDS = [
  'title',
  'status',
  'raw_notes',
  'technical_challenges',
  'metrics',
  'tech_stack',
  'github_url',
  'live_url',
  'sync_to_portfolio',
  'sync_to_resume',
] as const;

function pickProjectFields(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const field of PROJECT_FIELDS) {
    if (field in body) updates[field] = body[field];
  }
  return updates;
}

export const ProjectsController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('hailmary_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true, data: data ?? [] });
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const fields = pickProjectFields(req.body);

    if (!fields.title || typeof fields.title !== 'string' || !fields.title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    const { data, error } = await supabase
      .from('hailmary_projects')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    const fields = pickProjectFields(req.body);

    const { data, error } = await supabase
      .from('hailmary_projects')
      .update(fields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ success: false, error: 'Project not found' });
    res.status(200).json({ success: true, data });
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const { error } = await supabase
      .from('hailmary_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true });
  }),
};
