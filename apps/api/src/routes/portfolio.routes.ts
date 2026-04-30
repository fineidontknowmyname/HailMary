import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';

const router = Router();

// Public route — no auth required. Serves a compiled HTML portfolio page.
router.get('/:username', PortfolioController.serve);

export default router;
