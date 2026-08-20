import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiRateLimit } from '../middleware/aiRateLimit';

const router = Router();

router.post('/doubt', requireAuth, aiRateLimit, AIController.askDoubt);
router.post('/challenge', requireAuth, aiRateLimit, AIController.getChallenge);
router.post('/evaluate', requireAuth, aiRateLimit, AIController.submitFeynman);

export default router;