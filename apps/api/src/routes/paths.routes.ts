import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { PathsController } from '../controllers/paths.controller';

const router = Router();

router.use(requireAuth);

router.get('/', PathsController.list);
router.post('/', PathsController.create);
router.put('/:id', PathsController.update);
router.delete('/:id', PathsController.remove);

export default router;
