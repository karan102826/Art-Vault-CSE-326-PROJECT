import { Router, Request, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken } from '../middleware/auth.ts';
import { requireAdmin } from '../middleware/rbac.ts';

const router = Router();

// GET /api/categories
router.get('/', (_req: Request, res: Response): void => {
  try {
    const categories = db.getAllCategories();
    res.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        iconName: c.icon_name,
        artworkCount: c.artwork_count,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

// POST /api/categories (Admin only)
router.post('/', verifyToken, requireAdmin, (req: Request, res: Response): void => {
  try {
    const { name, slug, description, iconName } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: 'Category name and slug are required' });
      return;
    }

    const created = db.createCategory(name, slug, description || '', iconName || 'Folder');
    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description,
        iconName: created.icon_name,
        artworkCount: 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

export default router;
