import { Router, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken, AuthRequest } from '../middleware/auth.ts';
import { requireAdmin } from '../middleware/rbac.ts';

const router = Router();

// GET /api/admin/stats
router.get('/stats', verifyToken, requireAdmin, (_req: AuthRequest, res: Response): void => {
  try {
    const stats = db.getAdminStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/orders
router.get('/orders', verifyToken, requireAdmin, (_req: AuthRequest, res: Response): void => {
  try {
    const orders = db.getAllOrders();
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch platform orders' });
  }
});

export default router;
