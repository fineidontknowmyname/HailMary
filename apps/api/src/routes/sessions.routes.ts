import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { aiRateLimit } from '../middleware/aiRateLimit';
import { SessionsController } from '../controllers/sessions.controller';

const router = Router();

router.use(requireAuth);

router.post('/start', SessionsController.start);
router.post('/end', SessionsController.end);
router.post('/ai-tutor', aiRateLimit, SessionsController.aiTutor);

export default router;
