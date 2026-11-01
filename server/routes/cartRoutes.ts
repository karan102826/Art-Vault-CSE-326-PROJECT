import { Router, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/cart
router.get('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const cart = db.getCart(userId);

    let subtotal = 0;
    const items = cart.map(item => {
      const art = item.artwork;
      const price = art
        ? item.license_tier === 'commercial'
          ? Number(art.price_commercial)
          : Number(art.base_price_personal)
        : 0;
      subtotal += price;

      return {
        id: item.id,
        userId: item.user_id,
        artworkId: item.artwork_id,
        licenseTier: item.license_tier,
        createdAt: item.created_at,
        price,
        artwork: art
          ? {
              id: art.id,
              title: art.title,
              slug: art.slug,
              thumbnailUrl: art.thumbnail_url,
              artistName: art.artist_name,
              fileFormats: art.file_formats,
              resolution: art.resolution,
              basePricePersonal: Number(art.base_price_personal),
              priceCommercial: Number(art.price_commercial),
            }
          : null,
      };
    });

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    res.json({
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
      count: items.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cart' });
  }
});

// POST /api/cart
router.post('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { artworkId, licenseTier = 'personal' } = req.body;

    if (!artworkId) {
      res.status(400).json({ error: 'artworkId is required' });
      return;
    }

    const tier = licenseTier === 'commercial' ? 'commercial' : 'personal';
    const item = db.addToCart(userId, Number(artworkId), tier);

    res.status(201).json({
      message: 'Artwork added to cart',
      item,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add to cart' });
  }
});

// PATCH /api/cart/:artworkId (Update license tier in cart)
router.patch('/:artworkId', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const artworkId = Number(req.params.artworkId);
    const { licenseTier } = req.body;

    if (!licenseTier || !['personal', 'commercial'].includes(licenseTier)) {
      res.status(400).json({ error: 'Valid licenseTier (personal or commercial) is required' });
      return;
    }

    const updated = db.updateCartItemLicense(userId, artworkId, licenseTier);
    if (!updated) {
      res.status(404).json({ error: 'Item not in cart' });
      return;
    }

    res.json({
      message: 'Cart item license updated',
      item: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update cart' });
  }
});

// DELETE /api/cart/:artworkId
router.delete('/:artworkId', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const artworkId = Number(req.params.artworkId);
    db.removeFromCart(userId, artworkId);
    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove from cart' });
  }
});

// DELETE /api/cart (Clear all)
router.delete('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    db.clearCart(userId);
    res.json({ message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear cart' });
  }
});

export default router;
