import type { AuthenticatedRequest } from '../types/express';
import { catchAsync } from '../middleware/errorHandler';
import { recommendationsService } from '../services/recommendations.service';

export const RecommendationsController = {
  forSections: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const { sections } = req.body;
    const list = Array.isArray(sections)
      ? sections.filter((s): s is string => typeof s === 'string')
      : [];

    if (list.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const data = await recommendationsService.forSections(list);
    res.status(200).json({ success: true, data });
  }),

  nextAction: catchAsync<AuthenticatedRequest>(async (req, res) => {
    const data = await recommendationsService.nextAction(req.user.id);
    res.status(200).json({ success: true, data });
  }),
};
