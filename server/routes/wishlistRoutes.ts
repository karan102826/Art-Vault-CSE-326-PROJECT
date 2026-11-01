import { Router, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/wishlist
router.get('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const items = db.getWishlist(userId);

    res.json({
      items: items.map(w => ({
        id: w.id,
        userId: w.user_id,
        artworkId: w.artwork_id,
        createdAt: w.created_at,
        artwork: w.artwork
          ? {
              id: w.artwork.id,
              title: w.artwork.title,
              slug: w.artwork.slug,
              thumbnailUrl: w.artwork.thumbnail_url,
              artistName: w.artwork.artist_name,
              categoryName: w.artwork.category_name,
              basePricePersonal: Number(w.artwork.base_price_personal),
              priceCommercial: Number(w.artwork.price_commercial),
              averageRating: Number(w.artwork.average_rating),
              reviewCount: Number(w.artwork.review_count),
              fileFormats: w.artwork.file_formats,
            }
          : null,
      })),
      count: items.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch wishlist' });
  }
});

// POST /api/wishlist/toggle
router.post('/toggle', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { artworkId } = req.body;

    if (!artworkId) {
      res.status(400).json({ error: 'artworkId is required' });
      return;
    }

    const result = db.toggleWishlist(userId, Number(artworkId));
    res.json({
      message: result.wishlisted ? 'Added to saved collection' : 'Removed from saved collection',
      wishlisted: result.wishlisted,
      artworkId: Number(artworkId),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle wishlist' });
  }
});

export default router;
