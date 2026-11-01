import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/db.ts';
import { verifyToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// POST /api/orders/checkout
router.post('/checkout', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { billingName, billingEmail, paymentMethod = 'card' } = req.body;

    if (!billingName || !billingEmail) {
      res.status(400).json({ error: 'Billing name and email are required for digital license issuance' });
      return;
    }

    const { order, items } = db.checkout(userId, {
      billingName,
      billingEmail,
      paymentMethod,
    });

    res.status(201).json({
      message: 'Order completed successfully! Digital assets and licenses unlocked.',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        subtotal: order.subtotal,
        tax: order.tax,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        billingName: order.billing_name,
        billingEmail: order.billing_email,
        createdAt: order.created_at,
        items: items.map(item => ({
          id: item.id,
          orderId: item.order_id,
          artworkId: item.artwork_id,
          licenseTier: item.license_tier,
          pricePaid: item.price_paid,
          downloadToken: item.download_token,
          downloadCount: item.download_count,
          artwork: item.artwork
            ? {
                id: item.artwork.id,
                title: item.artwork.title,
                slug: item.artwork.slug,
                thumbnailUrl: item.artwork.thumbnail_url,
                artistName: item.artwork.artist_name,
                fileFormats: item.artwork.file_formats,
                resolution: item.artwork.resolution,
                fileSizeMb: Number(item.artwork.file_size_mb),
              }
            : null,
        })),
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Checkout failed' });
  }
});

// GET /api/orders/my-library
router.get('/my-library', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const orders = db.getUserOrders(userId);

    // Extract all unique purchased items across orders for the digital library view
    const libraryItems: any[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        libraryItems.push({
          orderItemId: item.id,
          orderId: order.id,
          orderNumber: order.order_number,
          purchasedAt: order.created_at,
          licenseTier: item.license_tier,
          pricePaid: item.price_paid,
          downloadToken: item.download_token,
          downloadCount: item.download_count,
          artwork: item.artwork
            ? {
                id: item.artwork.id,
                title: item.artwork.title,
                slug: item.artwork.slug,
                thumbnailUrl: item.artwork.thumbnail_url,
                artistName: item.artwork.artist_name,
                categoryName: item.artwork.category_name,
                fileFormats: item.artwork.file_formats,
                resolution: item.artwork.resolution,
                fileSizeMb: Number(item.artwork.file_size_mb),
                downloadUrl: item.artwork.download_url,
              }
            : null,
        });
      });
    });

    res.json({
      libraryItems,
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        subtotal: o.subtotal,
        tax: o.tax,
        totalAmount: o.total_amount,
        createdAt: o.created_at,
        itemCount: o.items.length,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch digital library' });
  }
});

// GET /api/orders/download/:token (Direct tokenized file download endpoint)
router.get('/download/:token', (req: Request, res: Response): void => {
  try {
    const token = req.params.token;
    const item = db.getOrderItemByToken(token);

    if (!item || !item.artwork) {
      res.status(404).json({ error: 'Invalid or revoked download token' });
      return;
    }

    const { artwork, license_tier } = item;
    const safeTitle = artwork.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `ArtVault_${safeTitle}_${license_tier.toUpperCase()}_v1.zip`;

    // Generate SHA-256 license signature
    const licenseHash = crypto
      .createHash('sha256')
      .update(`${token}:${item.order_id}:${artwork.id}:${license_tier}`)
      .digest('hex');

    // Craft authentic digital asset manifest and license agreement
    const packageManifest = {
      marketplace: 'ArtVault Digital Art Marketplace',
      downloadToken: token,
      licenseHash,
      issuedToOrder: item.order ? item.order.order_number : 'DIRECT_DISPATCH',
      licensedBuyer: item.order ? item.order.billing_name : 'Authorized Licensee',
      issuedAt: item.created_at,
      artworkDetails: {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist_name,
        category: artwork.category_name,
        resolution: artwork.resolution,
        fileFormats: artwork.file_formats,
        fileSizeMb: artwork.file_size_mb,
      },
      licenseTerms: {
        tier: license_tier,
        commercialUsageAllowed: license_tier === 'commercial',
        redistributionAllowed: false,
        attributionRequired: license_tier === 'personal',
        jurisdiction: 'Digital Millennium Copyright and Berne Convention Standards',
      },
      assetManifest: [
        `${safeTitle}_Master.${artwork.file_formats.split(',')[0].trim()}`,
        `${safeTitle}_Preview.png`,
        'LICENSE_AGREEMENT.txt',
        'AUTHENTICITY_METADATA.json',
      ],
      notice: 'This authentic digital bundle was cryptographically signed and dispatched by ArtVault.',
    };

    // Return downloadable JSON metadata bundle with headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.send(JSON.stringify(packageManifest, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Download retrieval failed' });
  }
});

// GET /api/orders/certificate/:orderItemId
router.get('/certificate/:orderItemId', verifyToken, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const orderItemId = Number(req.params.orderItemId);
    const orders = db.getUserOrders(userId);

    let targetItem: any = null;
    let targetOrder: any = null;

    for (const order of orders) {
      const match = order.items.find(i => i.id === orderItemId);
      if (match) {
        targetItem = match;
        targetOrder = order;
        break;
      }
    }

    if (!targetItem) {
      res.status(404).json({ error: 'Order item not found in your library' });
      return;
    }

    const verificationHash = crypto
      .createHash('sha256')
      .update(`${targetItem.download_token}:${targetOrder.order_number}:${targetItem.artwork_id}`)
      .digest('hex');

    res.json({
      certificateId: `AVC-${targetOrder.order_number.replace('ORD-', '')}-${targetItem.id}`,
      verificationHash,
      licenseeName: targetOrder.billing_name,
      licenseeEmail: targetOrder.billing_email,
      orderNumber: targetOrder.order_number,
      purchasedAt: targetOrder.created_at,
      licenseTier: targetItem.license_tier,
      pricePaid: targetItem.price_paid,
      artwork: {
        id: targetItem.artwork.id,
        title: targetItem.artwork.title,
        artistName: targetItem.artwork.artist_name,
        thumbnailUrl: targetItem.artwork.thumbnail_url,
        fileFormats: targetItem.artwork.file_formats,
        resolution: targetItem.artwork.resolution,
      },
      legalRights:
        targetItem.license_tier === 'commercial'
          ? 'Perpetual worldwide non-exclusive commercial license. Permitted in unlimited commercial projects, client deliverables, video games, interactive media, film/motion design, and monetized broadcasts. Resale of raw assets prohibited.'
          : 'Perpetual non-exclusive personal license. Permitted for private, educational, non-monetized portfolio presentation, and non-commercial study. Commercial redistribution or client deployment prohibited.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate certificate' });
  }
});

export default router;
