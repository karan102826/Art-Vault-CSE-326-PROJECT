-- ============================================================================
-- ArtVault Digital Art Marketplace - Initial Seed Data
-- ============================================================================

-- Ensure pgcrypto is available for password generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing data in order
TRUNCATE TABLE reviews, order_items, orders, wishlists, cart_items, artworks, categories, users RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. SEED USERS (1 Admin, 2 Buyers)
-- Passwords:
-- admin@artvault.io -> AdminSecret123!
-- buyer@artvault.io -> Password123!
-- artist.maya@artvault.io -> Password123!
-- ============================================================================
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, bio)
VALUES
(
    1,
    'admin@artvault.io',
    crypt('AdminSecret123!', gen_salt('bf', 10)),
    'Elena Vance (System Admin)',
    'admin',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    'Lead platform administrator and curation director at ArtVault.'
),
(
    2,
    'buyer@artvault.io',
    crypt('Password123!', gen_salt('bf', 10)),
    'Marcus Reed',
    'buyer',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
    'Senior Art Director & Game Dev enthusiast building indie sci-fi experiences.'
),
(
    3,
    'artist.maya@artvault.io',
    crypt('Password123!', gen_salt('bf', 10)),
    'Maya Lin',
    'buyer',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    'Freelance illustrator, 3D world builder, and technical artist.'
);

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ============================================================================
-- 2. SEED CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, slug, description, icon_name)
VALUES
(
    1,
    '3D Assets & Models',
    '3d-assets',
    'High-fidelity 3D meshes, textures, PBR materials, and rigged character models.',
    'Box'
),
(
    2,
    'Concept Art & Matte',
    'concept-art',
    'Cinematic environment designs, keyframes, world-building kits, and visual development.',
    'Image'
),
(
    3,
    'Vector & UI Illustrations',
    'vector-illustrations',
    'Infinitely scalable SVG/AI artwork, modern UI graphics, isometric sets, and icons.',
    'PenTool'
),
(
    4,
    'Pixel Art & Sprites',
    'pixel-art',
    'Retro game character sheets, tilemaps, animated sprites, and nostalgic pixel landscapes.',
    'Grid'
),
(
    5,
    'Shader & VFX Packs',
    'shader-packs',
    'Real-time HLSL/GLSL shaders, procedural material nodes, and particle simulation presets.',
    'Sparkles'
);

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- ============================================================================
-- 3. SEED ARTWORKS (10 Production-Grade Showcase Items)
-- ============================================================================
INSERT INTO artworks (
    id,
    title,
    slug,
    description,
    artist_name,
    artist_bio,
    artist_avatar,
    category_id,
    thumbnail_url,
    preview_images,
    file_formats,
    resolution,
    file_size_mb,
    download_url,
    base_price_personal,
    price_commercial,
    average_rating,
    review_count,
    is_featured
)
VALUES
(
    1,
    'Cyberpunk Neo-Tokyo Alleyway Kit',
    'cyberpunk-neo-tokyo-alleyway-kit',
    'A cinematic 3D environment kit featuring 45 modular building facades, glowing neon signage, volumetric rain decals, and high-density street props. Rigged for Unreal Engine 5 Nanite and Blender Cycles with 4K PBR textures.',
    'Kaelen Voss',
    'Senior environment artist with 8+ years experience in AAA game production and cyberpunk aesthetic design.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    1,
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'BLEND, FBX, OBJ, GLTF, 4K PBR Maps',
    '8192x8192 px UDIMs (PBR 4K)',
    420.50,
    'https://cdn.artvault.io/vault/files/artvault-cyberpunk-tokyo-v1.zip',
    39.00,
    119.00,
    4.90,
    14,
    true
),
(
    2,
    'Astral Citadel: Floating Monoliths',
    'astral-citadel-floating-monoliths',
    'Epic fantasy matte painting and concept art pack exploring hyper-detailed floating celestial monoliths. Includes layered PSD with atmospheric depth passes, color grading LUTs, and high-res printable PNGs.',
    'Lyra Sterling',
    'Digital illustrator and fantasy world-builder featured in Spectrum Fantastic Art and ImagineFX.',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    2,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'PSD (32-Bit), TIFF, PNG, Procreate',
    '7680x4320 px (8K UHD 300 DPI)',
    315.20,
    'https://cdn.artvault.io/vault/files/artvault-astral-citadel-8k.zip',
    29.00,
    79.00,
    4.85,
    9,
    true
),
(
    3,
    'Prism Minimalist 3D Glass Geometry',
    'prism-minimalist-3d-glass-geometry',
    'An ultra-modern collection of 28 caustics-rendered abstract glass geometries, dispersion prisms, and frosted translucent shapes. Perfect for web design, fintech branding, and motion design backdrops.',
    'Soren Holst',
    'Copenhagen-based 3D typography and abstract motion designer focusing on light refraction.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    1,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'C4D, BLEND, PNG (Alpha), EXR',
    '6000x4000 px 300 DPI',
    188.00,
    'https://cdn.artvault.io/vault/files/artvault-prism-glass-geometry.zip',
    24.00,
    65.00,
    4.78,
    11,
    true
),
(
    4,
    'Retro 16-Bit Cyber Dungeon Sprite Sheet',
    'retro-16-bit-cyber-dungeon-sprite-sheet',
    'Complete RPG sprite kit with 12 character archetypes (Idle, Run, Attack, Death), 48 animated dungeon tiles, traps, items, and UI dialogue boxes calibrated for 16x16 and 32x32 pixel art grids.',
    'Kenji Tanaka',
    'Veteran indie game pixel artist and animator known for retro platformers and Metroidvania titles.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    4,
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'ASEPRITE, PNG (Sprite Sheets), JSON Atlas',
    'Pixel Perfect Grids (16x16, 32x32)',
    28.40,
    'https://cdn.artvault.io/vault/files/artvault-cyber-dungeon-sprites.zip',
    19.00,
    49.00,
    4.92,
    18,
    false
),
(
    5,
    'Procedural Liquid Chrome & Hologram Shaders',
    'procedural-liquid-chrome-and-hologram-shaders',
    'A versatile shader library featuring 16 real-time procedural materials: iridescent liquid chrome, iridescent soap film, scanline holograms, and sci-fi shield matrices for Three.js, Unity URP, and Blender.',
    'Vespera Lab',
    'Creative coding collective specializing in WebGL, real-time shaders, and dynamic visual systems.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    5,
    'https://images.unsplash.com/photo-1633493106185-38b4d13b4fa5?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1633493106185-38b4d13b4fa5?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'GLSL, HLSL, SHADERGRAPH, BLEND Node Trees',
    'Resolution Agnostic (Procedural Vectors)',
    14.60,
    'https://cdn.artvault.io/vault/files/artvault-liquid-chrome-shaders.zip',
    34.00,
    89.00,
    4.95,
    22,
    true
),
(
    6,
    'Neo-Genesis Modular UI Vector System',
    'neo-genesis-modular-ui-vector-system',
    '150+ ultra-clean vector components and futuristic HUD motifs. Includes isometric flow diagrams, sci-fi interface frames, data telemetry charts, and cleanly organized SVG symbols.',
    'Amara Thorne',
    'UI/UX specialist and graphic designer designing tactical cockpits and automotive interfaces.',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
    3,
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'SVG, AI, FIGMA, EPS, PDF',
    'Scalable Vector Graphics (Infinite)',
    45.80,
    'https://cdn.artvault.io/vault/files/artvault-neogenesis-vector-ui.zip',
    22.00,
    59.00,
    4.65,
    8,
    false
),
(
    7,
    'Solitude: Deep Exoplanet Exploration',
    'solitude-deep-exoplanet-exploration',
    'Breathtaking science-fiction concept artwork showcasing an astronaut overlooking an alien crystal canyon beneath twin ringed gas giants. Painted with cinematic lighting and custom brush textures.',
    'Darius Drake',
    'Cinematographer and digital matte painter working across science fiction film concepts.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    2,
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'PSD Layered, TIFF, PNG Master',
    '9600x5400 px 300 DPI (Master Canvas)',
    512.00,
    'https://cdn.artvault.io/vault/files/artvault-solitude-exoplanet.zip',
    32.00,
    85.00,
    4.88,
    16,
    false
),
(
    8,
    'Neon Shinjuku Isometric Pixel City',
    'neon-shinjuku-isometric-pixel-city',
    'A sprawling isometric pixel art metropolitan scene with animated traffic lanes, ramen bars, flickering billboards, and subway entrances. Master layered file with separate parallax levels.',
    'Kenji Tanaka',
    'Veteran indie game pixel artist and animator known for retro platformers and Metroidvania titles.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    4,
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'ASEPRITE, PSD, PNG 4K Upscaled',
    '3840x2160 px Native Pixel Art',
    72.10,
    'https://cdn.artvault.io/vault/files/artvault-shinjuku-pixel-city.zip',
    27.00,
    69.00,
    4.91,
    21,
    false
),
(
    9,
    'Bioluminescent Botanical Garden 3D Flora',
    'bioluminescent-botanical-garden-3d-flora',
    'Botanical collection of 18 glowing exotic alien plants, fungal spores, and glowing vines. Fully rigged for wind simulations in Unreal 5 and Blender with sub-surface scattering shaders.',
    'Kaelen Voss',
    'Senior environment artist with 8+ years experience in AAA game production and cyberpunk aesthetic design.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    1,
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'FBX, BLEND, GLTF, SpeedTree Assets',
    '4096x4096 px PBR Maps (SSS, Emission)',
    380.00,
    'https://cdn.artvault.io/vault/files/artvault-bioluminescent-flora.zip',
    35.00,
    95.00,
    4.82,
    7,
    false
),
(
    10,
    'Volumetric Particle Dust & Smoke VFX Node System',
    'volumetric-particle-dust-and-smoke-vfx-node-system',
    'Production-grade compute-based particle simulation bundle for Godot 4, Unity VFX Graph, and Blender Geometry Nodes. Create hyper-realistic floating embers, cosmic dust, and ground fog.',
    'Vespera Lab',
    'Creative coding collective specializing in WebGL, real-time shaders, and dynamic visual systems.',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    5,
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
    '["https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
    'UNITYPACKAGE, GODOT, BLEND, EXR Flipbooks',
    'High-Density 4K Simulation Caches',
    290.40,
    'https://cdn.artvault.io/vault/files/artvault-particle-dust-vfx.zip',
    31.00,
    75.00,
    4.70,
    6,
    false
);

SELECT setval('artworks_id_seq', (SELECT MAX(id) FROM artworks));

-- ============================================================================
-- 4. SEED SAMPLE REVIEWS
-- ============================================================================
INSERT INTO reviews (artwork_id, user_id, rating, comment, is_verified_purchase, created_at)
VALUES
(1, 2, 5, 'The modularity of the street facades saved our indie studio over two weeks of modeling. Clean UVs and the PBR rain materials look mind-blowing in Unreal Engine 5.2.', true, CURRENT_TIMESTAMP - INTERVAL '12 days'),
(1, 3, 5, 'Superb topology! The neon sign emissive shaders are balanced and easy to customize in Blender.', true, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 2, 5, 'Incredible scale and brush economy. Inspecting the raw layered PSD was a masterclass in atmospheric perspective.', true, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(3, 3, 5, 'Clean caustics rendering with true optical dispersion. These assets elevated our fintech brand landing page instantly.', true, CURRENT_TIMESTAMP - INTERVAL '14 days'),
(4, 2, 5, 'The animation frames are razor sharp. Zero ghost pixels, and the Aseprite file structure is very well grouped.', true, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(5, 3, 5, 'One of the best real-time GLSL liquid metal shaders I have ever tested. Framerate stays pinned at 60fps on mobile browsers.', true, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================================================
-- 5. SEED INITIAL SAMPLE ORDERS & WISHLISTS
-- ============================================================================
INSERT INTO orders (id, order_number, user_id, subtotal, tax, total_amount, payment_status, payment_method, billing_name, billing_email, created_at)
VALUES
(
    1,
    'ORD-20261015-88321',
    2,
    119.00,
    9.52,
    128.52,
    'completed',
    'card',
    'Marcus Reed',
    'buyer@artvault.io',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
);

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

INSERT INTO order_items (order_id, artwork_id, license_tier, price_paid, download_token, download_count)
VALUES
(
    1,
    1,
    'commercial',
    119.00,
    'dl_tok_8f93e2b19c4d2847a61e0bb5',
    3
);

-- Seed Wishlist for buyer
INSERT INTO wishlists (user_id, artwork_id)
VALUES
(2, 2),
(2, 5);

-- Seed Cart for buyer
INSERT INTO cart_items (user_id, artwork_id, license_tier)
VALUES
(2, 3, 'personal');
