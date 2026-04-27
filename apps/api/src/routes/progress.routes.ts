import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth'; // Ensure this matches your actual auth middleware path

const router = Router();

router.get('/', requireAuth, ProgressController.getMissionLog);
router.post('/', requireAuth, ProgressController.markIntelComplete);
router.delete('/:intelId', requireAuth, ProgressController.removeIntelProgress);

export default router;