import { Router } from 'express';
import { EducationController } from '../controllers/education.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', EducationController.list);
router.post('/', EducationController.create);
router.delete('/:id', EducationController.remove);

export default router;
