import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { catchAsync } from '../middleware/errorHandler';
import { supabase } from '../lib/supabase';

export const AIController = {
  askDoubt: catchAsync(async (req: Request, res: Response) => {
    const { intelId, question, context } = req.body;

    if (!intelId || !question || !context) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters. Need intelId, question, and context.' 
      });
    }

    const answer = await aiService.resolveDoubt(intelId, question, context);

    res.status(200).json({ success: true, data: answer });
  }),
  getChallenge: catchAsync(async (req: Request, res: Response) => {
    const { intelId, context } = req.body;

    if (!intelId || !context) {
      return res.status(400).json({ success: false, error: 'intelId and context are required' });
    }

    const challenge = await aiService.generateChallenge(intelId, context);
    res.status(200).json({ success: true, data: challenge });
  }),

  submitFeynman: catchAsync(async (req: Request, res: Response) => {
    const { intelId, challenge, response, context } = req.body;

    if (!intelId || !challenge || !response || !context) {
      return res.status(400).json({ success: false, error: 'Missing required evaluation parameters' });
    }

    const evaluation = await aiService.evaluateFeynman(context, challenge, response);

    if (evaluation.passed) {
      const user = (req as any).user;
      await supabase
        .from('user_progress')
        .upsert({ 
          user_id: user.id, 
          resource_id: intelId, 
          completed_at: new Date().toISOString(),
          challenge_completed: true,
          feynman_response: response
        });
    }

    res.status(200).json({ success: true, data: evaluation });
  })
};