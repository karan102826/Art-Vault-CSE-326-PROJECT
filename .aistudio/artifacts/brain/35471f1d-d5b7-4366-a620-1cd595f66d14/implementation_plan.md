# ArtVault — Digital Art Marketplace (PERN Stack)

A production-grade digital marketplace for curating, acquiring, and licensing world-class digital assets (3D environments, concept art matte paintings, procedural shaders, vector UI kits, and retro sprite sheets). Built with a PostgreSQL/Supabase backend foundation, Express REST API, React 19, and a high-contrast dark gallery aesthetic with warm ambient lighting.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following high-level product and technical directions have been aligned from your feedback:

- **Confirmed Persistence Architecture**: Full PostgreSQL database foundation structured for Supabase / PostgreSQL execution, complete with migrations (`schema.sql`), comprehensive seed records (`seed.sql`), and an in-process persistent query controller that guarantees instant zero-setup execution in this preview container while allowing direct Supabase connection via environment credentials.
- **Confirmed Aesthetic Direction**: High-contrast digital gallery aesthetic. Deep obsidian (`#0D0D11`) and onyx surfaces, warm amber/bronze ambient light accents (`#F59E0B`, `#D97706`), museum-grade artwork presentation cards, clean unboxed typography, and zero-pill metadata discipline.
- **Confirmed Asset Delivery & Licensing**: Multi-tier licensing (Personal vs. Commercial). Upon checkout completion, an atomic order transaction issues unique cryptographic download tokens, unlocks real downloadable zip/package asset bundles, and renders a verifiable Digital License Certificate with SHA-256 license hash and rights specification.

---

## 1. Overview & Core Concept

- **What It Does**: ArtVault connects technical artists, game developers, 3D world builders, and creative directors with verified high-fidelity digital art assets. Users can explore a categorized catalog with real-time filtering, evaluate layered high-res asset previews with format specifications (PSD, BLEND, GLTF, ASEPRITE), manage persistent carts with license tier switching, checkout with simulated payment validation, unlock lifetime download tokens, favorite items, leave verified reviews, and manage platform inventory via a role-protected Admin Dashboard.
- **Target Audience / Persona**: Game developers, VFX technical artists, creative directors, and digital illustrators sourcing production-ready modular assets and licensed artwork.
- **Key Value**: Instant clarity on file formats, dimensions, and licensing terms with immediate tokenized digital asset fulfillment and verifiable legal proof of license.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Discovery & Exploration**: Users land on a museum-grade gallery showcase featuring a curated hero artwork with depth-layer preview, followed by a category explorer (3D Assets, Concept Art, Vector UI, Pixel Art, Shader Packs).
2. **Catalog Refinement**: Interactive sidebar with real-time keyword search, category filters, dual-handle price range filter, minimum star rating selector, and multi-mode sorting (Newest, Price: Low to High, Price: High to Low, Top Rated).
3. **Artwork Deep-Dive (PDP)**: Sticky high-resolution gallery with zoom preview, format & resolution metadata (e.g. 8K UHD, 4K PBR maps, polygon budget), artist biography, interactive Personal vs. Commercial license tier toggle with dynamic price recalculation, and verified buyer reviews with star breakdowns.
4. **Persistent Cart & Checkout**: Slide-out cart drawer with license tier modifiers, subtotal and tax calculation, duplicate item prevention, and one-click checkout modal with simulated payment processing.
5. **Fulfillment & Digital Library**: Post-purchase confirmation generating an order receipt, permanent tokenized download link, and a modal-viewable "Digital License Certificate" suitable for enterprise asset audits. Buyers can revisit "My Purchases" anytime to re-download files.
6. **Community Verification & Review**: Authenticated buyers can rate artworks (1–5 stars) and write detailed reviews, triggering automatic server-side recalculation of the artwork's average rating.
7. **Admin Operations**: Role-based access control protecting an administrative control panel for creating, editing, and deleting artworks, updating categories, and monitoring platform-wide order receipts.

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast digital gallery. Sophisticated, museum-grade dark environment with warm gallery ambient lighting reminiscent of modern art exhibitions.
- **Color Palette & Discipline (60-30-10)**:
  - *60% Neutral Canvas*: Deep obsidian `#0A0A0E` and rich graphite `#121218`.
  - *30% Structural Surfaces*: Charcoal card surfaces `#1A1A24`, subtle hairline borders `rgba(255, 255, 255, 0.08)`, and warm muted body typography `#A1A1AA`.
  - *10% Warm Ambient Accent*: Warm amber `#F59E0B`, burnished gold `#D97706`, and subtle golden glow highlights (`rgba(245, 158, 11, 0.15)`).
- **Typography & Scale**:
  - *Display / Brand*: `Outfit` / `Plus Jakarta Sans` for clean, architectural headers with `text-wrap: balance`.
  - *Body Prose*: `Plus Jakarta Sans` for crystal-clear readability.
  - *Data & Specs*: `IBM Plex Mono` / `font-mono tabular-nums` for prices, resolution dimensions, file sizes, and token hashes.
- **Anti-Slop Discipline**:
  - No static pill badges on artwork cards; metadata formatted with subtle typographic separators (`·`).
  - Single-line top navigation conforming to the strict 3-zone Top Bar Contract.
  - No decorative pulsing dots or code-comment headers (`//`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Persistence & Database Execution Strategy**
  - *Chosen Approach*: Comprehensive PostgreSQL schema (`database/schema.sql`) and seed script (`database/seed.sql`) combined with an integrated PostgreSQL-compatible operational data engine in Express. This allows the application to execute immediately out-of-the-box in the web environment with full relational integrity (foreign keys, cascading deletes, unique constraints, and aggregate rating triggers), while supporting direct connection to external Supabase / PostgreSQL instances via `DATABASE_URL` or Supabase REST configurations.
  - *Why*: Eliminates cold-start database connection timeouts and environment crashes while preserving full SQL fidelity and multi-table ACID transactions.
- **Decision 2: Tokenized Download Delivery & License Certificate Generation**
  - *Chosen Approach*: When an order completes, the backend generates an unguessable cryptographic download token (`dl_tok_<hash>`) stored in `order_items`. The frontend provides immediate package downloads (generating valid ZIP/JSON metadata bundles with license files) and opens an official Digital License Certificate containing the buyer name, order ID, license scope (Personal vs Commercial), timestamp, and verification checksum.
  - *Why*: Delivers an authentic digital marketplace experience without relying on external file hosters that fail in sandboxed networks.
- **Decision 3: Role-Based Access Control (RBAC) & Session Management**
  - *Chosen Approach*: Stateless JWT authentication signed with secret keys, decoded client-side for immediate UI adaptation (buyer vs. admin navigation), and strictly enforced on Express routes (`/api/admin/*`, `/api/orders/*`, `/api/reviews/*`). Includes pre-seeded accounts for immediate one-click testing (`admin@artvault.io` and `buyer@artvault.io`).

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 FRONTEND                             │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │     Top Navigation      │  │        Global State Contexts        │  │
│  │  Brand · Nav · Actions  │  │  AuthContext · Cart · Wishlist      │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
│              │                                   │                     │
│  ┌───────────▼─────────────┐  ┌──────────────────▼──────────────────┐  │
│  │     Page Components     │  │          Interactive Modals         │  │
│  │  Home · Catalog · PDP   │  │  CheckoutModal · LicenseCertificate │  │
│  │  Library · Admin · Cart │  │  ArtworkEditModal · AuthModal       │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
└──────────────┼───────────────────────────────────┼─────────────────────┘
               │ Axios Client (Bearer JWT Tokens)  │
┌──────────────▼───────────────────────────────────▼─────────────────────┐
│                       EXPRESS.JS REST BACKEND                          │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  Auth & RBAC Middleware │  │       Zod Validation Pipeline       │  │
│  │  verifyToken, roleCheck │  │  authSchema, artworkSchema, order   │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
│              │                                   │                     │
│  ┌───────────▼───────────────────────────────────▼──────────────────┐  │
│  │                         API Routes                               │  │
│  │  /api/auth · /api/artworks · /api/categories · /api/cart         │  │
│  │  /api/wishlist · /api/orders · /api/reviews · /api/admin         │  │
│  └───────────────────────────┬──────────────────────────────────────┘  │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────────────┐
│                    POSTGRESQL / DATABASE ENGINE                        │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  users   │  │categories│  │ artworks │  │cart_items│  │wishlists │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘  │
│       │             │             │                                    │
│  ┌────▼─────┐       └──────┬──────┘                                    │
│  │  orders  ├──────────────┼────────────────────────────────────────┐  │
│  └────┬─────┘              │                                        │  │
│       │              ┌─────▼─────┐                            ┌─────▼─┐│
│  ┌────▼──────────┐   │  reviews  │ (Auto-calculates rating)   │files/ ││
│  │  order_items  │   └───────────┘                            │bundle ││
│  │download_tokens│                                            └───────┘│
│  └───────────────┘                                                     │
└────────────────────────────────────────────────────────────────────────┘
```

### 12 Mandatory Modules Implementation Plan

1. **User Authentication & RBAC**:
   - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
   - JWT tokens with bcrypt hash verification; roles: `'buyer'` and `'admin'`.
   - Preloaded with instant switcher buttons for quick demoing without manual typing.
2. **Artwork Catalogue**:
   - Endpoints: `GET /api/artworks` with cursor/page pagination, limit, category slug.
   - High-contrast responsive grid (3-col desktop, 2-col tablet, 1-col mobile).
3. **Category Management & Navigation**:
   - Endpoints: `GET /api/categories`, `POST /api/categories` (admin), `PUT /api/categories/:id`.
   - Clean horizontal category switcher with live counts and active indicators.
4. **Advanced Search, Filter & Sort**:
   - Real-time debounced search on titles, artist names, and descriptions.
   - Dual-slider price range filter and minimum rating selection (3+, 4+, 4.5+).
   - Sort criteria: Newest, Price: Low-to-High, Price: High-to-Low, Top Rated.
5. **Artwork Detail View (PDP)**:
   - Deep inspection modal/page with multi-image gallery preview and zoom.
   - Technical specifications card: file formats (PSD, BLEND, GLTF), pixel resolution, uncompressed size.
   - License tier selector (Personal vs. Commercial) detailing usage rights.
6. **Persistent Cart & Selection Management**:
   - Endpoints: `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/:id`, `DELETE /api/cart/:id`.
   - Prevents duplicate items; allows real-time license tier toggling directly in cart.
   - Dynamic calculations for subtotal, 8% digital tax, and grand total.
7. **Checkout & Order Workflow**:
   - Endpoint: `POST /api/orders/checkout`.
   - Multi-step simulated checkout (billing information, test card number, license review).
   - Atomic transaction creates order and order items, clears user cart, and returns receipt.
8. **Digital Library (My Purchases)**:
   - Endpoint: `GET /api/orders/my-library`.
   - Buyer dashboard displaying all purchased digital assets, license badges, transaction dates, and direct download links.
   - Interactive modal to view and print the official "Digital License Certificate".
9. **Wishlist / Saved Collections**:
   - Endpoints: `GET /api/wishlist`, `POST /api/wishlist/toggle`.
   - One-click heart toggle on cards and detail pages with optimistic UI updates.
10. **Verified Reviews & Star Ratings**:
    - Endpoints: `GET /api/artworks/:id/reviews`, `POST /api/reviews`.
    - 1–5 star interactive input with review comment; automatically recalculates average rating and review count.
11. **Admin CRUD Dashboard**:
    - Endpoints: `POST /api/artworks`, `PUT /api/artworks/:id`, `DELETE /api/artworks/:id`, `GET /api/admin/orders`.
    - Modal forms for creating/editing artworks with format badges and pricing controls; platform-wide order log table.
12. **End-to-End Validation & Responsive UI**:
    - Zod schemas validating every API payload with user-friendly error responses.
    - Inline client-side form validation with accessible error labels.
    - WCAG AA compliant contrast, dark gallery palette with warm ambient lighting.

---

### Verification & Testing Plan
- Run full compilation check via `compile_applet`.
- Verify database queries, transactional order creation, and cart state transitions.
- Validate role switching between Admin and Buyer for dashboard and review access.
- Confirm tokenized file delivery triggers valid client-side download actions.
