-- ============================================================================
-- ArtVault Digital Art Marketplace - Database Schema
-- Target Engine: PostgreSQL 14+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS & ROLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'admin')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Palette',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ARTWORKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    artist_name VARCHAR(150) NOT NULL,
    artist_bio TEXT,
    artist_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    thumbnail_url TEXT NOT NULL,
    preview_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    file_formats VARCHAR(120) NOT NULL,
    resolution VARCHAR(120) NOT NULL,
    file_size_mb NUMERIC(8, 2) NOT NULL,
    download_url TEXT NOT NULL,
    base_price_personal NUMERIC(10, 2) NOT NULL CHECK (base_price_personal >= 0),
    price_commercial NUMERIC(10, 2) NOT NULL CHECK (price_commercial >= base_price_personal),
    average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CART ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    license_tier VARCHAR(20) NOT NULL DEFAULT 'personal' CHECK (license_tier IN ('personal', 'commercial')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_artwork_cart UNIQUE (user_id, artwork_id)
);

-- ============================================================================
-- 5. WISHLISTS (SAVED COLLECTIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artwork_id INT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_artwork_wishlist UNIQUE (user_id, artwork_id)
);

-- ============================================================================
-- 6. ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'card',
    billing_name VARCHAR(150) NOT NULL,
    billing_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. ORDER ITEMS (UNLOCKED PURCHASES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    artwork_id INT NOT NULL REFERENCES artworks(id) ON DELETE RESTRICT,
    license_tier VARCHAR(20) NOT NULL CHECK (license_tier IN ('personal', 'commercial')),
    price_paid NUMERIC(10, 2) NOT NULL CHECK (price_paid >= 0),
    download_token VARCHAR(128) NOT NULL UNIQUE,
    download_count INT NOT NULL DEFAULT 0 CHECK (download_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. REVIEWS & VERIFIED RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    artwork_id INT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_artwork_user_review UNIQUE (artwork_id, user_id)
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_artworks_category_id ON artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_price_personal ON artworks(base_price_personal);
CREATE INDEX IF NOT EXISTS idx_artworks_average_rating ON artworks(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_is_featured ON artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_artwork_id ON order_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reviews_artwork_id ON reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- GIN Index for rapid search on title, artist_name, and description
CREATE INDEX IF NOT EXISTS idx_artworks_search ON artworks 
USING GIN (to_tsvector('english', title || ' ' || artist_name || ' ' || description));

-- ============================================================================
-- AUTOMATED TRIGGERS & PROCEDURES
-- ============================================================================

-- 1. Universal updated_at timestamp refresher
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_artworks_updated_at ON artworks;
CREATE TRIGGER trigger_artworks_updated_at
BEFORE UPDATE ON artworks
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 2. Aggregate Rating & Review Count Auto-Recalculation Trigger
CREATE OR REPLACE FUNCTION refresh_artwork_rating_aggregates()
RETURNS TRIGGER AS $$
DECLARE
    target_artwork_id INT;
    v_avg NUMERIC(3, 2);
    v_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_artwork_id := OLD.artwork_id;
    ELSE
        target_artwork_id := NEW.artwork_id;
    END IF;

    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
        COUNT(id)
    INTO v_avg, v_count
    FROM reviews
    WHERE artwork_id = target_artwork_id;

    UPDATE artworks
    SET 
        average_rating = v_avg,
        review_count = v_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_artwork_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_artwork_rating ON reviews;
CREATE TRIGGER trigger_refresh_artwork_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_artwork_rating_aggregates();
