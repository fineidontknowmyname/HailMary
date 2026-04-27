import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, ProfileController.getProfile);
router.put('/', requireAuth, ProfileController.updateProfile);

export default router;