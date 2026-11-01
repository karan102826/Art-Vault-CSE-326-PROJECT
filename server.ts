import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes.ts';
import artworkRoutes from './server/routes/artworkRoutes.ts';
import categoryRoutes from './server/routes/categoryRoutes.ts';
import cartRoutes from './server/routes/cartRoutes.ts';
import wishlistRoutes from './server/routes/wishlistRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import reviewRoutes from './server/routes/reviewRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json());

  // Mount API REST Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/artworks', artworkRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'ArtVault Digital Art Marketplace',
      version: '1.0.0',
      database: 'PostgreSQL Engine (Active)',
      timestamp: new Date().toISOString(),
    });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error occurred',
    });
  });

  // Vite middleware in dev; static file serving in production
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ArtVault PERN Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error in ArtVault server:', err);
  process.exit(1);
});
