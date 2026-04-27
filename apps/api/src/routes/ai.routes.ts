import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/doubt', requireAuth, AIController.askDoubt);
router.post('/challenge', requireAuth, AIController.getChallenge);
router.post('/evaluate', requireAuth, AIController.submitFeynman);

export default router;