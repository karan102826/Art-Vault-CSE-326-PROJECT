import { Router, Request, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/reviews/:artworkId
router.get('/:artworkId', (req: Request, res: Response): void => {
  try {
    const artworkId = Number(req.params.artworkId);
    const reviews = db.getArtworkReviews(artworkId);
    res.json({ reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
});

// POST /api/reviews
router.post('/', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { artworkId, rating, comment } = req.body;

    if (!artworkId || !rating || !comment) {
      res.status(400).json({ error: 'artworkId, rating, and comment are required' });
      return;
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      return;
    }

    if (comment.trim().length < 5) {
      res.status(400).json({ error: 'Review comment must be at least 5 characters long' });
      return;
    }

    const reviews = db.addReview(Number(artworkId), userId, numericRating, comment.trim());
    const updatedArtwork = db.getArtworkById(Number(artworkId));

    res.status(201).json({
      message: 'Review submitted successfully',
      reviews,
      updatedArtwork: updatedArtwork
        ? {
            averageRating: updatedArtwork.average_rating,
            reviewCount: updatedArtwork.review_count,
          }
        : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
});

export default router;
