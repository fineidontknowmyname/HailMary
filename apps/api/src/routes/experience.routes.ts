import { Router } from 'express';
import { ExperienceController } from '../controllers/experience.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', ExperienceController.list);
router.post('/', ExperienceController.create);
router.delete('/:id', ExperienceController.remove);

export default router;
