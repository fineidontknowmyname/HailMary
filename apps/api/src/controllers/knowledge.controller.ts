import type { AuthenticatedRequest } from '../types/express';
import { catchAsync } from '../middleware/errorHandler';
import { knowledgeState } from '../services/knowledgeState.service';

export const KnowledgeController = {
  state: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const data = await knowledgeState.listForUser(req.user.id);
    res.status(200).json({ success: true, data });
  }),
};
