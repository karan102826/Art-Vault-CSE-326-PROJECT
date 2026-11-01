import { Router, Request, Response } from 'express';
import { db } from '../database/db.ts';
import { verifyToken } from '../middleware/auth.ts';
import { requireAdmin } from '../middleware/rbac.ts';

const router = Router();

// Helper to format artwork response with camelCase
function formatArtwork(art: any) {
  if (!art) return null;
  return {
    id: art.id,
    title: art.title,
    slug: art.slug,
    description: art.description,
    artistName: art.artist_name,
    artistBio: art.artist_bio,
    artistAvatar: art.artist_avatar,
    categoryId: art.category_id,
    categoryName: art.category_name,
    categorySlug: art.category_slug,
    thumbnailUrl: art.thumbnail_url,
    previewImages: art.preview_images || [],
    fileFormats: art.file_formats,
    resolution: art.resolution,
    fileSizeMb: Number(art.file_size_mb),
    downloadUrl: art.download_url,
    basePricePersonal: Number(art.base_price_personal),
    priceCommercial: Number(art.price_commercial),
    averageRating: Number(art.average_rating),
    reviewCount: Number(art.review_count),
    isFeatured: Boolean(art.is_featured),
    createdAt: art.created_at,
    updatedAt: art.updated_at,
  };
}

// GET /api/artworks - List with filters, search, and pagination
router.get('/', (req: Request, res: Response): void => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      page = '1',
      limit = '12',
    } = req.query;

    const result = db.getArtworks({
      categorySlug: category as string,
      searchQuery: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      sortBy: sortBy as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({
      items: result.items.map(formatArtwork),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: result.limit,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch artworks' });
  }
});

// GET /api/artworks/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response): void => {
  try {
    const param = req.params.idOrSlug;
    const isId = /^\d+$/.test(param);
    const art = isId ? db.getArtworkById(Number(param)) : db.getArtworkBySlug(param);

    if (!art) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    res.json({ artwork: formatArtwork(art) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch artwork' });
  }
});

// POST /api/artworks (Admin only)
router.post('/', verifyToken, requireAdmin, (req: Request, res: Response): void => {
  try {
    const {
      title,
      description,
      artistName,
      artistBio,
      artistAvatar,
      categoryId,
      thumbnailUrl,
      previewImages,
      fileFormats,
      resolution,
      fileSizeMb,
      downloadUrl,
      basePricePersonal,
      priceCommercial,
      isFeatured,
    } = req.body;

    if (!title || !description || !artistName || !categoryId || !thumbnailUrl || !basePricePersonal) {
      res.status(400).json({ error: 'Missing required artwork parameters' });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newArt = db.createArtwork({
      title,
      slug,
      description,
      artist_name: artistName,
      artist_bio: artistBio || '',
      artist_avatar: artistAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      category_id: Number(categoryId),
      thumbnail_url: thumbnailUrl,
      preview_images: Array.isArray(previewImages) ? previewImages : [thumbnailUrl],
      file_formats: fileFormats || 'ZIP, PNG, OBJ',
      resolution: resolution || '4096x4096 px',
      file_size_mb: Number(fileSizeMb) || 150.0,
      download_url: downloadUrl || 'https://cdn.artvault.io/vault/files/artvault-bundle.zip',
      base_price_personal: Number(basePricePersonal),
      price_commercial: Number(priceCommercial) || Number(basePricePersonal) * 2.5,
      is_featured: Boolean(isFeatured),
    });

    res.status(201).json({
      message: 'Artwork created successfully',
      artwork: formatArtwork(newArt),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create artwork' });
  }
});

// PUT /api/artworks/:id (Admin only)
router.put('/:id', verifyToken, requireAdmin, (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const updated = db.updateArtwork(id, {
      title: req.body.title,
      description: req.body.description,
      artist_name: req.body.artistName,
      artist_bio: req.body.artistBio,
      artist_avatar: req.body.artistAvatar,
      category_id: req.body.categoryId ? Number(req.body.categoryId) : undefined,
      thumbnail_url: req.body.thumbnailUrl,
      preview_images: req.body.previewImages,
      file_formats: req.body.fileFormats,
      resolution: req.body.resolution,
      file_size_mb: req.body.fileSizeMb !== undefined ? Number(req.body.fileSizeMb) : undefined,
      download_url: req.body.downloadUrl,
      base_price_personal: req.body.basePricePersonal !== undefined ? Number(req.body.basePricePersonal) : undefined,
      price_commercial: req.body.priceCommercial !== undefined ? Number(req.body.priceCommercial) : undefined,
      is_featured: req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : undefined,
    });

    if (!updated) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }

    res.json({
      message: 'Artwork updated successfully',
      artwork: formatArtwork(updated),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update artwork' });
  }
});

// DELETE /api/artworks/:id (Admin only)
router.delete('/:id', verifyToken, requireAdmin, (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const success = db.deleteArtwork(id);
    if (!success) {
      res.status(404).json({ error: 'Artwork not found' });
      return;
    }
    res.json({ message: 'Artwork deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete artwork' });
  }
});

export default router;
