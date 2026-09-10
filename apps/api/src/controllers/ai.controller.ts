import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import type { AiMode } from '../services/aiService';
import { catchAsync } from '../middleware/errorHandler';
import { supabase } from '../lib/supabase';
import { knowledgeState } from '../services/knowledgeState.service';
import type { AuthenticatedRequest } from '../types/express';

const VALID_MODES: AiMode[] = ['tutor', 'debugger'];
const MAX_QUESTION_LENGTH = 1000;
const MAX_RESPONSE_LENGTH = 2000;

export const AIController = {
  askDoubt: catchAsync(async (req: Request, res: Response) => {
    const { intelId, question, context, mode } = req.body;

    if (!intelId || !question || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters. Need intelId, question, and context.'
      });
    }

    if (typeof question !== 'string' || question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `question must be ${MAX_QUESTION_LENGTH} characters or fewer`,
      });
    }

    // Validate mode if provided, default to 'tutor'
    const resolvedMode: AiMode = VALID_MODES.includes(mode) ? mode : 'tutor';

    const answer = await aiService.resolveDoubt(intelId, question, context, resolvedMode);

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

  submitFeynman: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { intelId, challenge, response, context } = req.body;

    if (!intelId || !challenge || !response || !context) {
      return res.status(400).json({ success: false, error: 'Missing required evaluation parameters' });
    }

    if (typeof response !== 'string' || response.length > MAX_RESPONSE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `response must be ${MAX_RESPONSE_LENGTH} characters or fewer`,
      });
    }

    const evaluation = await aiService.evaluateFeynman(context, challenge, response);
    const user = req.user;
    const topics = await knowledgeState.resourceTopics(intelId);

    if (evaluation.passed) {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          resource_id: intelId,
          completed_at: new Date().toISOString(),
          challenge_completed: true,
          feynman_response: response,
          verified_by: evaluation.verifiedBy,
        }, { onConflict: 'user_id,resource_id' });

      if (error) throw new Error(error.message);

      await knowledgeState.recordFeynman(user.id, topics, evaluation.verifiedBy);
    } else {
      await knowledgeState.recordStruggle(user.id, topics, evaluation.misconception);
    }

    res.status(200).json({ success: true, data: evaluation });
  })
};