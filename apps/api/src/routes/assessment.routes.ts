import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/generate', AssessmentController.generateQuestions);
router.post('/submit', requireAuth, AssessmentController.submitAnswers);

export default router;
