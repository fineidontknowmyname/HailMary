import { Router } from 'express';
import { IntelController } from '../controllers/intel.controller';

const router = Router();

// GET /api/intel
router.get('/', IntelController.getAllIntel);

export default router;