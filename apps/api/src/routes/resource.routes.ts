import { Router } from 'express';
import multer from 'multer';
import { uploadResource, contributeResource } from '../controllers/resource.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', requireAuth, upload.single('file'), uploadResource);
router.post('/contribute', contributeResource);

export default router;
