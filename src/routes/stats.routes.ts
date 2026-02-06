import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const statsController = new StatsController();

// Get dashboard stats - requires admin
router.get(
  '/dashboard',
  authenticate,
  authorize(['admin']),
  asyncHandler((req, res) => statsController.getDashboardStats(req, res))
);

export default router;
