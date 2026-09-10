import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { AssessmentsController } from '../controllers/assessments.controller';

const router = Router();

router.use(requireAuth);

router.post('/', AssessmentsController.submit);
router.get('/', AssessmentsController.history);

export default router;
