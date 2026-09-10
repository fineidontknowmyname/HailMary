import type { AuthenticatedRequest } from '../types/express';
import { supabase } from '../lib/supabase';
import { catchAsync } from '../middleware/errorHandler';
import { pathsService } from '../services/paths.service';

const PATH_FIELDS = ['domain', 'language', 'level', 'goal'] as const;

export const PathsController = {
  list: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { data, error } = await supabase
      .from('user_paths')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    res.status(200).json({ success: true, data: data ?? [] });
  }),

  create: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { domain } = req.body;
    if (typeof domain !== 'string' || !domain.trim()) {
      return res.status(400).json({ success: false, error: 'domain is required' });
    }

    const providedOrder = Array.isArray(req.body.path_order)
      ? req.body.path_order.filter((id: unknown): id is string => typeof id === 'string')
      : null;

    const path_order = providedOrder && providedOrder.length > 0
      ? providedOrder
      : await pathsService.seedOrder(domain);

    const row: Record<string, unknown> = { user_id: req.user.id, domain: domain.trim(), path_order };
    for (const field of ['language', 'level', 'goal'] as const) {
      if (typeof req.body[field] === 'string') row[field] = req.body[field];
    }

    const { data, error } = await supabase
      .from('user_paths')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(error.message);
    res.status(201).json({ success: true, data });
  }),

  update: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { id } = req.params;
    const updates: Record<string, unknown> = {};

    for (const field of PATH_FIELDS) {
      if (field in req.body) updates[field] = req.body[field];
    }
    if (Array.isArray(req.body.path_order)) {
      updates.path_order = req.body.path_order.filter((v: unknown): v is string => typeof v === 'string');
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No updatable fields provided' });
    }

    const { data, error } = await supabase
      .from('user_paths')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ success: false, error: 'Path not found' });
    res.status(200).json({ success: true, data });
  }),

  remove: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('user_paths')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id');

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Path not found' });
    }
    res.status(200).json({ success: true });
  }),
};
