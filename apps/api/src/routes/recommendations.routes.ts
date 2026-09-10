import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { RecommendationsController } from '../controllers/recommendations.controller';

const router = Router();

router.use(requireAuth);

router.post('/sections', RecommendationsController.forSections);
router.get('/next-action', RecommendationsController.nextAction);

export default router;
