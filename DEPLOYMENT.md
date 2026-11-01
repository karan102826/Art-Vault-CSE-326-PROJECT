# ArtVault — Vercel & Render Deployment Guide

ArtVault is engineered with a hybrid architecture capable of running as:
1. **Serverless Functions + Static SPA** on **Vercel**
2. **Persistent Web Service + Managed PostgreSQL** on **Render**
3. **Full-Stack Container** on Google Cloud / Docker

---

## 1. Deploying to Vercel (Serverless)

Vercel hosts the React frontend via Edge CDN and runs the Express API as a serverless function via `api/index.ts`.

### Steps:
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New Project** and import the repository.
3. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in Project Settings:
   - `JWT_SECRET`: Any random 32+ character string (e.g. `secret_artvault_jwt_key_prod_2026`)
   - `NODE_ENV`: `production`
   - *(Optional)* `DATABASE_URL`: Connection string for Supabase or external PostgreSQL. If omitted, ArtVault runs with its built-in relational engine preloaded with `seed.sql`.
5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app` with both frontend and `/api/*` endpoints working seamlessly.

---

## 2. Deploying to Render (Web Service + PostgreSQL)

Render runs ArtVault as a standard Node.js web service with persistent connections, health checks, and optional free PostgreSQL.

### Option A: 1-Click Blueprint (Recommended)
1. In the [Render Dashboard](https://dashboard.render.com), navigate to **Blueprints** → **New Blueprint Instance**.
2. Connect your repository. Render automatically reads `render.yaml`.
3. Render will provision:
   - **`artvault-postgres`**: Free managed PostgreSQL instance.
   - **`artvault-marketplace`**: Node.js web service running `npm install && npm run build` and `npm run start`.
4. Click **Apply**. Both your database and web application will deploy automatically.

### Option B: Manual Web Service Setup on Render
1. Click **New +** → **Web Service**.
2. Connect repository.
3. Configure settings:
   - **Name**: `artvault-marketplace`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (which executes `tsx server.ts`)
4. Under **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render binds this port automatically)
   - `JWT_SECRET`: Random 32+ character secret
5. Under **Health Check Path**: `/api/health`
6. Click **Create Web Service**.

---

## 3. Database Migration & Seeding (for Remote PostgreSQL / Supabase)

To populate a newly created PostgreSQL or Supabase database with ArtVault's schema and initial artworks:
- Run `database/schema.sql` in the PostgreSQL query console.
- Run `database/seed.sql` to populate sample categories, artworks, test users, and reviews.
