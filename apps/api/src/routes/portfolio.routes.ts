import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';

const router = Router();

router.get('/:username', PortfolioController.getPublicPortfolio);

export default router;
