import { Router } from 'express';
import multer from 'multer';
import { uploadResource, contributeResource } from '../controllers/resource.controller';
import { requireAuth } from '../middleware/auth';
import { createUserRateLimit } from '../middleware/aiRateLimit';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const contributeRateLimit = createUserRateLimit('contribute-rate', 10, 60 * 60);

router.post('/upload', requireAuth, upload.single('file'), uploadResource);
router.post('/contribute', requireAuth, contributeRateLimit, contributeResource);

export default router;
