import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { KnowledgeController } from '../controllers/knowledge.controller';

const router = Router();

router.get('/', requireAuth, KnowledgeController.state);

export default router;
