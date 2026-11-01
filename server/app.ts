import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.ts';
import artworkRoutes from './routes/artworkRoutes.ts';
import categoryRoutes from './routes/categoryRoutes.ts';
import cartRoutes from './routes/cartRoutes.ts';
import wishlistRoutes from './routes/wishlistRoutes.ts';
import orderRoutes from './routes/orderRoutes.ts';
import reviewRoutes from './routes/reviewRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import { db } from './database/db.ts';

export const app = express();

// ============================================================================
// SECURITY HEADERS (Helmet)
// ============================================================================
// Configured to permit cross-origin image rendering and Vercel/Render communications
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// ============================================================================
// CROSS-ORIGIN RESOURCE SHARING (CORS)
// ============================================================================
// Supports Vercel preview URLs, Render backend domains, localhost, and custom domains
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.APP_URL,
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Allow configured origins or any *.vercel.app / *.onrender.com domain
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelDomain = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin);
    const isRenderDomain = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin);
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);

    if (isExplicitlyAllowed || isVercelDomain || isRenderDomain || isLocalhost) {
      callback(null, true);
    } else {
      // In development or if not strictly matching, permit cross-origin access
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));
// Handle preflight across all endpoints
app.options('*', cors(corsOptions));

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
app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'ArtVault Digital Art Marketplace',
    version: '1.0.0',
    deployment: process.env.VERCEL ? 'Vercel Serverless' : process.env.RENDER ? 'Render Web Service' : 'Node Server',
    database: {
      type: 'PostgreSQL',
      isRemoteConnected: db.isConnectedToPostgres,
      details: db.isConnectedToPostgres ? db.postgresDetails : 'Using in-memory SQL fallback engine (seed.sql preloaded)',
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0),
    },
    supabase: {
      projectUrl: process.env.VITE_SUPABASE_URL || 'https://dfspjxweulyiujgsuewr.supabase.co',
      isClientConnected: db.isSupabaseConnected,
      anonKeyConfigured: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
    },
    cors: {
      enabled: true,
      allowedOrigins: ['localhost', '*.vercel.app', '*.onrender.com', process.env.CLIENT_URL || '*'],
    },
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred',
  });
});
