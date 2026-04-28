import { Router } from 'express';
import multer from 'multer';
import { uploadResource } from '../controllers/resource.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', requireAuth, upload.single('file'), uploadResource);

export default router;
