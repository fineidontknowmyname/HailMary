import { Router } from 'express';
import { ProjectsController } from '../controllers/projects.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', ProjectsController.list);
router.post('/', ProjectsController.create);
router.put('/:id', ProjectsController.update);
router.delete('/:id', ProjectsController.remove);

export default router;
