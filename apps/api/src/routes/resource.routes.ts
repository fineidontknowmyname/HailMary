import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResource, contributeResource } from '../controllers/resource.controller';
import { requireAuth } from '../middleware/auth';
import { createUserRateLimit } from '../middleware/aiRateLimit';

const router = Router();
const contributeRateLimit = createUserRateLimit('contribute-rate', 10, 60 * 60);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'text/plain': ['.txt'],
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ALLOWED_TYPES[file.mimetype];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExts || !allowedExts.includes(ext)) {
      cb(new Error('Unsupported file type. Allowed: PDF, PNG, JPEG, WEBP, GIF, TXT.'));
      return;
    }
    cb(null, true);
  },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ success: false, error: 'File exceeds the 10MB size limit.' });
      return;
    }
    if (err) {
      res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Invalid file upload.' });
      return;
    }
    next();
  });
}

router.post('/upload', requireAuth, handleUpload, uploadResource);
router.post('/contribute', requireAuth, contributeRateLimit, contributeResource);

export default router;
