import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pg from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface DBUser {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'buyer' | 'admin';
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  created_at: string;
}

export interface DBArtwork {
  id: number;
  title: string;
  slug: string;
  description: string;
  artist_name: string;
  artist_bio: string;
  artist_avatar: string;
  category_id: number;
  thumbnail_url: string;
  preview_images: string[];
  file_formats: string;
  resolution: string;
  file_size_mb: number;
  download_url: string;
  base_price_personal: number;
  price_commercial: number;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBCartItem {
  id: number;
  user_id: number;
  artwork_id: number;
  license_tier: 'personal' | 'commercial';
  created_at: string;
}

export interface DBWishlistItem {
  id: number;
  user_id: number;
  artwork_id: number;
  created_at: string;
}

export interface DBOrder {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  tax: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  billing_name: string;
  billing_email: string;
  created_at: string;
}

export interface DBOrderItem {
  id: number;
  order_id: number;
  artwork_id: number;
  license_tier: 'personal' | 'commercial';
  price_paid: number;
  download_token: string;
  download_count: number;
  created_at: string;
}

export interface DBReview {
  id: number;
  artwork_id: number;
  user_id: number;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

// In-Memory Database Engine holding full relational state initialized from seed.sql
class DatabaseEngine {
  private users: DBUser[] = [];
  private categories: DBCategory[] = [];
  private artworks: DBArtwork[] = [];
  private cartItems: DBCartItem[] = [];
  private wishlists: DBWishlistItem[] = [];
  private orders: DBOrder[] = [];
  private orderItems: DBOrderItem[] = [];
  private reviews: DBReview[] = [];

  private nextUserId = 4;
  private nextCategoryId = 6;
  private nextArtworkId = 11;
  private nextCartId = 2;
  private nextWishlistId = 3;
  private nextOrderId = 2;
  private nextOrderItemId = 2;
  private nextReviewId = 7;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Users (password: 'AdminSecret123!' and 'Password123!')
    const adminHash = bcrypt.hashSync('AdminSecret123!', 10);
    const buyerHash = bcrypt.hashSync('Password123!', 10);

    this.users = [
      {
        id: 1,
        email: 'admin@artvault.io',
        password_hash: adminHash,
        full_name: 'Elena Vance (System Admin)',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        bio: 'Lead platform administrator and curation director at ArtVault.',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 2,
        email: 'buyer@artvault.io',
        password_hash: buyerHash,
        full_name: 'Marcus Reed',
        role: 'buyer',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        bio: 'Senior Art Director & Game Dev building indie sci-fi experiences.',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 3,
        email: 'artist.maya@artvault.io',
        password_hash: buyerHash,
        full_name: 'Maya Lin',
        role: 'buyer',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        bio: 'Freelance illustrator, 3D world builder, and technical artist.',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ];

    // 2. Seed Categories
    this.categories = [
      {
        id: 1,
        name: '3D Assets & Models',
        slug: '3d-assets',
        description: 'High-fidelity 3D meshes, textures, PBR materials, and rigged character models.',
        icon_name: 'Box',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Concept Art & Matte',
        slug: 'concept-art',
        description: 'Cinematic environment designs, keyframes, world-building kits, and visual development.',
        icon_name: 'Image',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Vector & UI Illustrations',
        slug: 'vector-illustrations',
        description: 'Infinitely scalable SVG/AI artwork, modern UI graphics, isometric sets, and icons.',
        icon_name: 'PenTool',
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        name: 'Pixel Art & Sprites',
        slug: 'pixel-art',
        description: 'Retro game character sheets, tilemaps, animated sprites, and nostalgic pixel landscapes.',
        icon_name: 'Grid',
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        name: 'Shader & VFX Packs',
        slug: 'shader-packs',
        description: 'Real-time HLSL/GLSL shaders, procedural material nodes, and particle simulation presets.',
        icon_name: 'Sparkles',
        created_at: new Date().toISOString(),
      },
    ];

    // 3. Seed Artworks (10 items matching seed.sql)
    this.artworks = [
      {
        id: 1,
        title: 'Cyberpunk Neo-Tokyo Alleyway Kit',
        slug: 'cyberpunk-neo-tokyo-alleyway-kit',
        description: 'A cinematic 3D environment kit featuring 45 modular building facades, glowing neon signage, volumetric rain decals, and high-density street props. Rigged for Unreal Engine 5 Nanite and Blender Cycles with 4K PBR textures.',
        artist_name: 'Kaelen Voss',
        artist_bio: 'Senior environment artist with 8+ years experience in AAA game production and cyberpunk aesthetic design.',
        artist_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        category_id: 1,
        thumbnail_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'BLEND, FBX, OBJ, GLTF, 4K PBR Maps',
        resolution: '8192x8192 px UDIMs (PBR 4K)',
        file_size_mb: 420.50,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-cyberpunk-tokyo-v1.zip',
        base_price_personal: 39.00,
        price_commercial: 119.00,
        average_rating: 4.90,
        review_count: 14,
        is_featured: true,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Astral Citadel: Floating Monoliths',
        slug: 'astral-citadel-floating-monoliths',
        description: 'Epic fantasy matte painting and concept art pack exploring hyper-detailed floating celestial monoliths. Includes layered PSD with atmospheric depth passes, color grading LUTs, and high-res printable PNGs.',
        artist_name: 'Lyra Sterling',
        artist_bio: 'Digital illustrator and fantasy world-builder featured in Spectrum Fantastic Art and ImagineFX.',
        artist_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        category_id: 2,
        thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'PSD (32-Bit), TIFF, PNG, Procreate',
        resolution: '7680x4320 px (8K UHD 300 DPI)',
        file_size_mb: 315.20,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-astral-citadel-8k.zip',
        base_price_personal: 29.00,
        price_commercial: 79.00,
        average_rating: 4.85,
        review_count: 9,
        is_featured: true,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Prism Minimalist 3D Glass Geometry',
        slug: 'prism-minimalist-3d-glass-geometry',
        description: 'An ultra-modern collection of 28 caustics-rendered abstract glass geometries, dispersion prisms, and frosted translucent shapes. Perfect for web design, fintech branding, and motion design backdrops.',
        artist_name: 'Soren Holst',
        artist_bio: 'Copenhagen-based 3D typography and abstract motion designer focusing on light refraction.',
        artist_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        category_id: 1,
        thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'C4D, BLEND, PNG (Alpha), EXR',
        resolution: '6000x4000 px 300 DPI',
        file_size_mb: 188.00,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-prism-glass-geometry.zip',
        base_price_personal: 24.00,
        price_commercial: 65.00,
        average_rating: 4.78,
        review_count: 11,
        is_featured: true,
        created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'Retro 16-Bit Cyber Dungeon Sprite Sheet',
        slug: 'retro-16-bit-cyber-dungeon-sprite-sheet',
        description: 'Complete RPG sprite kit with 12 character archetypes (Idle, Run, Attack, Death), 48 animated dungeon tiles, traps, items, and UI dialogue boxes calibrated for 16x16 and 32x32 pixel art grids.',
        artist_name: 'Kenji Tanaka',
        artist_bio: 'Veteran indie game pixel artist and animator known for retro platformers and Metroidvania titles.',
        artist_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
        category_id: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'ASEPRITE, PNG (Sprite Sheets), JSON Atlas',
        resolution: 'Pixel Perfect Grids (16x16, 32x32)',
        file_size_mb: 28.40,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-cyber-dungeon-sprites.zip',
        base_price_personal: 19.00,
        price_commercial: 49.00,
        average_rating: 4.92,
        review_count: 18,
        is_featured: false,
        created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 5,
        title: 'Procedural Liquid Chrome & Hologram Shaders',
        slug: 'procedural-liquid-chrome-and-hologram-shaders',
        description: 'A versatile shader library featuring 16 real-time procedural materials: iridescent liquid chrome, iridescent soap film, scanline holograms, and sci-fi shield matrices for Three.js, Unity URP, and Blender.',
        artist_name: 'Vespera Lab',
        artist_bio: 'Creative coding collective specializing in WebGL, real-time shaders, and dynamic visual systems.',
        artist_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
        category_id: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1633493106185-38b4d13b4fa5?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1633493106185-38b4d13b4fa5?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'GLSL, HLSL, SHADERGRAPH, BLEND Node Trees',
        resolution: 'Resolution Agnostic (Procedural Vectors)',
        file_size_mb: 14.60,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-liquid-chrome-shaders.zip',
        base_price_personal: 34.00,
        price_commercial: 89.00,
        average_rating: 4.95,
        review_count: 22,
        is_featured: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 6,
        title: 'Neo-Genesis Modular UI Vector System',
        slug: 'neo-genesis-modular-ui-vector-system',
        description: '150+ ultra-clean vector components and futuristic HUD motifs. Includes isometric flow diagrams, sci-fi interface frames, data telemetry charts, and cleanly organized SVG symbols.',
        artist_name: 'Amara Thorne',
        artist_bio: 'UI/UX specialist and graphic designer designing tactical cockpits and automotive interfaces.',
        artist_avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
        category_id: 3,
        thumbnail_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'SVG, AI, FIGMA, EPS, PDF',
        resolution: 'Scalable Vector Graphics (Infinite)',
        file_size_mb: 45.80,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-neogenesis-vector-ui.zip',
        base_price_personal: 22.00,
        price_commercial: 59.00,
        average_rating: 4.65,
        review_count: 8,
        is_featured: false,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 7,
        title: 'Solitude: Deep Exoplanet Exploration',
        slug: 'solitude-deep-exoplanet-exploration',
        description: 'Breathtaking science-fiction concept artwork showcasing an astronaut overlooking an alien crystal canyon beneath twin ringed gas giants. Painted with cinematic lighting and custom brush textures.',
        artist_name: 'Darius Drake',
        artist_bio: 'Cinematographer and digital matte painter working across science fiction film concepts.',
        artist_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        category_id: 2,
        thumbnail_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'PSD Layered, TIFF, PNG Master',
        resolution: '9600x5400 px 300 DPI (Master Canvas)',
        file_size_mb: 512.00,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-solitude-exoplanet.zip',
        base_price_personal: 32.00,
        price_commercial: 85.00,
        average_rating: 4.88,
        review_count: 16,
        is_featured: false,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 8,
        title: 'Neon Shinjuku Isometric Pixel City',
        slug: 'neon-shinjuku-isometric-pixel-city',
        description: 'A sprawling isometric pixel art metropolitan scene with animated traffic lanes, ramen bars, flickering billboards, and subway entrances. Master layered file with separate parallax levels.',
        artist_name: 'Kenji Tanaka',
        artist_bio: 'Veteran indie game pixel artist and animator known for retro platformers and Metroidvania titles.',
        artist_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
        category_id: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'ASEPRITE, PSD, PNG 4K Upscaled',
        resolution: '3840x2160 px Native Pixel Art',
        file_size_mb: 72.10,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-shinjuku-pixel-city.zip',
        base_price_personal: 27.00,
        price_commercial: 69.00,
        average_rating: 4.91,
        review_count: 21,
        is_featured: false,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 9,
        title: 'Bioluminescent Botanical Garden 3D Flora',
        slug: 'bioluminescent-botanical-garden-3d-flora',
        description: 'Botanical collection of 18 glowing exotic alien plants, fungal spores, and glowing vines. Fully rigged for wind simulations in Unreal 5 and Blender with sub-surface scattering shaders.',
        artist_name: 'Kaelen Voss',
        artist_bio: 'Senior environment artist with 8+ years experience in AAA game production and cyberpunk aesthetic design.',
        artist_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        category_id: 1,
        thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'FBX, BLEND, GLTF, SpeedTree Assets',
        resolution: '4096x4096 px PBR Maps (SSS, Emission)',
        file_size_mb: 380.00,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-bioluminescent-flora.zip',
        base_price_personal: 35.00,
        price_commercial: 95.00,
        average_rating: 4.82,
        review_count: 7,
        is_featured: false,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 10,
        title: 'Volumetric Particle Dust & Smoke VFX Node System',
        slug: 'volumetric-particle-dust-and-smoke-vfx-node-system',
        description: 'Production-grade compute-based particle simulation bundle for Godot 4, Unity VFX Graph, and Blender Geometry Nodes. Create hyper-realistic floating embers, cosmic dust, and ground fog.',
        artist_name: 'Vespera Lab',
        artist_bio: 'Creative coding collective specializing in WebGL, real-time shaders, and dynamic visual systems.',
        artist_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
        category_id: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
        preview_images: [
          'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
        ],
        file_formats: 'UNITYPACKAGE, GODOT, BLEND, EXR Flipbooks',
        resolution: 'High-Density 4K Simulation Caches',
        file_size_mb: 290.40,
        download_url: 'https://cdn.artvault.io/vault/files/artvault-particle-dust-vfx.zip',
        base_price_personal: 31.00,
        price_commercial: 75.00,
        average_rating: 4.70,
        review_count: 6,
        is_featured: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 4. Seed Reviews
    this.reviews = [
      {
        id: 1,
        artwork_id: 1,
        user_id: 2,
        rating: 5,
        comment: 'The modularity of the street facades saved our indie studio over two weeks of modeling. Clean UVs and the PBR rain materials look mind-blowing in Unreal Engine 5.2.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
      {
        id: 2,
        artwork_id: 1,
        user_id: 3,
        rating: 5,
        comment: 'Superb topology! The neon sign emissive shaders are balanced and easy to customize in Blender.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 3,
        artwork_id: 2,
        user_id: 2,
        rating: 5,
        comment: 'Incredible scale and brush economy. Inspecting the raw layered PSD was a masterclass in atmospheric perspective.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 4,
        artwork_id: 3,
        user_id: 3,
        rating: 5,
        comment: 'Clean caustics rendering with true optical dispersion. These assets elevated our fintech brand landing page instantly.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 5,
        artwork_id: 4,
        user_id: 2,
        rating: 5,
        comment: 'The animation frames are razor sharp. Zero ghost pixels, and the Aseprite file structure is very well grouped.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 6,
        artwork_id: 5,
        user_id: 3,
        rating: 5,
        comment: 'One of the best real-time GLSL liquid metal shaders I have ever tested. Framerate stays pinned at 60fps on mobile browsers.',
        is_verified_purchase: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // 5. Seed Order
    this.orders = [
      {
        id: 1,
        order_number: 'ORD-20261015-88321',
        user_id: 2,
        subtotal: 119.00,
        tax: 9.52,
        total_amount: 128.52,
        payment_status: 'completed',
        payment_method: 'card',
        billing_name: 'Marcus Reed',
        billing_email: 'buyer@artvault.io',
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
    ];

    this.orderItems = [
      {
        id: 1,
        order_id: 1,
        artwork_id: 1,
        license_tier: 'commercial',
        price_paid: 119.00,
        download_token: 'dl_tok_8f93e2b19c4d2847a61e0bb5',
        download_count: 3,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      },
    ];

    // Seed Wishlist
    this.wishlists = [
      { id: 1, user_id: 2, artwork_id: 2, created_at: new Date().toISOString() },
      { id: 2, user_id: 2, artwork_id: 5, created_at: new Date().toISOString() },
    ];

    // Seed Cart
    this.cartItems = [
      { id: 1, user_id: 2, artwork_id: 3, license_tier: 'personal', created_at: new Date().toISOString() },
    ];
  }

  // --- USERS METHODS ---
  public findUserByEmail(email: string): DBUser | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: number): DBUser | undefined {
    return this.users.find(u => u.id === id);
  }

  public createUser(email: string, passwordHash: string, fullName: string, role: 'buyer' | 'admin' = 'buyer'): DBUser {
    const newUser: DBUser = {
      id: this.nextUserId++,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`,
      bio: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // --- CATEGORIES METHODS ---
  public getAllCategories(): (DBCategory & { artwork_count: number })[] {
    return this.categories.map(cat => ({
      ...cat,
      artwork_count: this.artworks.filter(a => a.category_id === cat.id).length,
    }));
  }

  public findCategoryById(id: number): DBCategory | undefined {
    return this.categories.find(c => c.id === id);
  }

  public findCategoryBySlug(slug: string): DBCategory | undefined {
    return this.categories.find(c => c.slug === slug);
  }

  public createCategory(name: string, slug: string, description: string, iconName: string = 'Palette'): DBCategory {
    const newCategory: DBCategory = {
      id: this.nextCategoryId++,
      name,
      slug,
      description,
      icon_name: iconName,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // --- ARTWORKS METHODS ---
  public getArtworks(options: {
    categorySlug?: string;
    searchQuery?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.artworks];

    if (options.categorySlug && options.categorySlug !== 'all') {
      const cat = this.findCategoryBySlug(options.categorySlug);
      if (cat) {
        result = result.filter(a => a.category_id === cat.id);
      }
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.artist_name.toLowerCase().includes(q) ||
        a.file_formats.toLowerCase().includes(q)
      );
    }

    if (options.minPrice !== undefined) {
      result = result.filter(a => a.base_price_personal >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      result = result.filter(a => a.base_price_personal <= options.maxPrice!);
    }

    if (options.minRating !== undefined && options.minRating > 0) {
      result = result.filter(a => a.average_rating >= options.minRating!);
    }

    // Sort
    switch (options.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.base_price_personal - b.base_price_personal);
        break;
      case 'price_desc':
        result.sort((a, b) => b.base_price_personal - a.base_price_personal);
        break;
      case 'top_rated':
        result.sort((a, b) => b.average_rating - a.average_rating || b.review_count - a.review_count);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    const total = result.length;
    const page = options.page || 1;
    const limit = options.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    const items = paginated.map(art => {
      const cat = this.findCategoryById(art.category_id);
      return {
        ...art,
        category_name: cat ? cat.name : 'Digital Art',
        category_slug: cat ? cat.slug : '',
      };
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  public getArtworkById(id: number) {
    const art = this.artworks.find(a => a.id === id);
    if (!art) return undefined;
    const cat = this.findCategoryById(art.category_id);
    return {
      ...art,
      category_name: cat ? cat.name : 'Digital Art',
      category_slug: cat ? cat.slug : '',
    };
  }

  public getArtworkBySlug(slug: string) {
    const art = this.artworks.find(a => a.slug === slug);
    if (!art) return undefined;
    const cat = this.findCategoryById(art.category_id);
    return {
      ...art,
      category_name: cat ? cat.name : 'Digital Art',
      category_slug: cat ? cat.slug : '',
    };
  }

  public createArtwork(data: Omit<DBArtwork, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'review_count'>): DBArtwork {
    const newArt: DBArtwork = {
      ...data,
      id: this.nextArtworkId++,
      average_rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.artworks.unshift(newArt);
    return newArt;
  }

  public updateArtwork(id: number, data: Partial<DBArtwork>): DBArtwork | undefined {
    const index = this.artworks.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.artworks[index] = {
      ...this.artworks[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.artworks[index];
  }

  public deleteArtwork(id: number): boolean {
    const index = this.artworks.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.artworks.splice(index, 1);
    // Cascade delete cart and wishlist items
    this.cartItems = this.cartItems.filter(c => c.artwork_id !== id);
    this.wishlists = this.wishlists.filter(w => w.artwork_id !== id);
    this.reviews = this.reviews.filter(r => r.artwork_id !== id);
    return true;
  }

  // --- CART METHODS ---
  public getCart(userId: number) {
    const items = this.cartItems.filter(c => c.user_id === userId);
    return items.map(item => {
      const art = this.getArtworkById(item.artwork_id);
      return {
        ...item,
        artwork: art,
      };
    });
  }

  public addToCart(userId: number, artworkId: number, licenseTier: 'personal' | 'commercial' = 'personal') {
    const existing = this.cartItems.find(c => c.user_id === userId && c.artwork_id === artworkId);
    if (existing) {
      existing.license_tier = licenseTier;
      return existing;
    }
    const newItem: DBCartItem = {
      id: this.nextCartId++,
      user_id: userId,
      artwork_id: artworkId,
      license_tier: licenseTier,
      created_at: new Date().toISOString(),
    };
    this.cartItems.push(newItem);
    return newItem;
  }

  public updateCartItemLicense(userId: number, artworkId: number, licenseTier: 'personal' | 'commercial') {
    const item = this.cartItems.find(c => c.user_id === userId && c.artwork_id === artworkId);
    if (item) {
      item.license_tier = licenseTier;
      return item;
    }
    return undefined;
  }

  public removeFromCart(userId: number, artworkId: number) {
    this.cartItems = this.cartItems.filter(c => !(c.user_id === userId && c.artwork_id === artworkId));
    return true;
  }

  public clearCart(userId: number) {
    this.cartItems = this.cartItems.filter(c => c.user_id !== userId);
  }

  // --- WISHLIST METHODS ---
  public getWishlist(userId: number) {
    const items = this.wishlists.filter(w => w.user_id === userId);
    return items.map(item => {
      const art = this.getArtworkById(item.artwork_id);
      return {
        ...item,
        artwork: art,
      };
    });
  }

  public toggleWishlist(userId: number, artworkId: number): { wishlisted: boolean } {
    const existingIndex = this.wishlists.findIndex(w => w.user_id === userId && w.artwork_id === artworkId);
    if (existingIndex !== -1) {
      this.wishlists.splice(existingIndex, 1);
      return { wishlisted: false };
    } else {
      this.wishlists.push({
        id: this.nextWishlistId++,
        user_id: userId,
        artwork_id: artworkId,
        created_at: new Date().toISOString(),
      });
      return { wishlisted: true };
    }
  }

  // --- ORDERS & CHECKOUT TRANSACTION ---
  public checkout(
    userId: number,
    billingInfo: { billingName: string; billingEmail: string; paymentMethod?: string }
  ) {
    const cart = this.getCart(userId);
    if (cart.length === 0) {
      throw new Error('Your cart is empty');
    }

    let subtotal = 0;
    const orderItemsToCreate: { artworkId: number; licenseTier: 'personal' | 'commercial'; price: number }[] = [];

    for (const item of cart) {
      if (!item.artwork) continue;
      const price = item.license_tier === 'commercial' ? item.artwork.price_commercial : item.artwork.base_price_personal;
      subtotal += price;
      orderItemsToCreate.push({
        artworkId: item.artwork_id,
        licenseTier: item.license_tier,
        price,
      });
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const newOrder: DBOrder = {
      id: this.nextOrderId++,
      order_number: orderNumber,
      user_id: userId,
      subtotal,
      tax,
      total_amount: totalAmount,
      payment_status: 'completed',
      payment_method: billingInfo.paymentMethod || 'card',
      billing_name: billingInfo.billingName,
      billing_email: billingInfo.billingEmail,
      created_at: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Create Order Items with unique download tokens
    const createdItems: (DBOrderItem & { artwork: any })[] = [];
    for (const item of orderItemsToCreate) {
      const downloadToken = `dl_tok_${crypto.randomBytes(16).toString('hex')}`;
      const newOrderItem: DBOrderItem = {
        id: this.nextOrderItemId++,
        order_id: newOrder.id,
        artwork_id: item.artworkId,
        license_tier: item.licenseTier,
        price_paid: item.price,
        download_token: downloadToken,
        download_count: 0,
        created_at: new Date().toISOString(),
      };
      this.orderItems.push(newOrderItem);
      createdItems.push({
        ...newOrderItem,
        artwork: this.getArtworkById(item.artworkId),
      });
    }

    // Atomic Clear Cart
    this.clearCart(userId);

    return {
      order: newOrder,
      items: createdItems,
    };
  }

  public getUserOrders(userId: number) {
    const userOrders = this.orders.filter(o => o.user_id === userId);
    return userOrders.map(order => {
      const items = this.orderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          artwork: this.getArtworkById(item.artwork_id),
        }));
      return {
        ...order,
        items,
      };
    });
  }

  public getAllOrders() {
    return this.orders.map(order => {
      const user = this.findUserById(order.user_id);
      const items = this.orderItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          ...item,
          artwork: this.getArtworkById(item.artwork_id),
        }));
      return {
        ...order,
        user_name: user?.full_name || 'Anonymous',
        items,
      };
    });
  }

  public getOrderItemByToken(downloadToken: string) {
    const item = this.orderItems.find(oi => oi.download_token === downloadToken);
    if (!item) return undefined;
    item.download_count += 1;
    const art = this.getArtworkById(item.artwork_id);
    const order = this.orders.find(o => o.id === item.order_id);
    return {
      ...item,
      artwork: art,
      order,
    };
  }

  // --- REVIEWS METHODS ---
  public getArtworkReviews(artworkId: number) {
    const reviews = this.reviews.filter(r => r.artwork_id === artworkId);
    return reviews.map(r => {
      const user = this.findUserById(r.user_id);
      return {
        id: r.id,
        artworkId: r.artwork_id,
        userId: r.user_id,
        userName: user ? user.full_name : 'Verified Collector',
        userAvatar: user?.avatar_url,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.is_verified_purchase,
        createdAt: r.created_at,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addReview(artworkId: number, userId: number, rating: number, comment: string) {
    // Check if user already reviewed
    const existingIndex = this.reviews.findIndex(r => r.artwork_id === artworkId && r.user_id === userId);
    if (existingIndex !== -1) {
      this.reviews[existingIndex].rating = rating;
      this.reviews[existingIndex].comment = comment;
      this.reviews[existingIndex].updated_at = new Date().toISOString();
    } else {
      const newReview: DBReview = {
        id: this.nextReviewId++,
        artwork_id: artworkId,
        user_id: userId,
        rating,
        comment,
        is_verified_purchase: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.reviews.push(newReview);
    }

    // Trigger recalculation of aggregate rating and review count
    this.recalculateArtworkRating(artworkId);

    return this.getArtworkReviews(artworkId);
  }

  private recalculateArtworkRating(artworkId: number) {
    const reviews = this.reviews.filter(r => r.artwork_id === artworkId);
    const art = this.artworks.find(a => a.id === artworkId);
    if (!art) return;

    if (reviews.length === 0) {
      art.average_rating = 0;
      art.review_count = 0;
    } else {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      art.average_rating = Math.round((sum / reviews.length) * 100) / 100;
      art.review_count = reviews.length;
    }
  }

  // --- STATS FOR ADMIN DASHBOARD ---
  public getAdminStats() {
    const totalRevenue = this.orders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalDownloads = this.orderItems.reduce((sum, oi) => sum + oi.download_count, 0);
    return {
      totalArtworks: this.artworks.length,
      totalOrders: this.orders.length,
      totalUsers: this.users.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDownloads,
    };
  }

  // --- POSTGRESQL POOL INTEGRATION ---
  public pgPool: pg.Pool | null = null;
  public isConnectedToPostgres = false;
  public postgresDetails: { dbName?: string; user?: string } = {};

  public async initPostgresConnection(): Promise<boolean> {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim().length > 0) {
      try {
        const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
        this.pgPool = new pg.Pool({
          connectionString: dbUrl,
          ssl: isLocal ? false : { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });

        const res = await this.pgPool.query('SELECT current_database(), current_user');
        this.isConnectedToPostgres = true;
        this.postgresDetails = {
          dbName: res.rows[0].current_database,
          user: res.rows[0].current_user,
        };
        console.log(`✅ [PostgreSQL Connected] Database: ${this.postgresDetails.dbName} as User: ${this.postgresDetails.user}`);
        return true;
      } catch (err: any) {
        this.isConnectedToPostgres = false;
        console.warn(`⚠️ [PostgreSQL Connect Notice] Remote connection could not be established (${err.message}). Using in-memory engine fallback.`);
        return false;
      }
    }
    return false;
  }

  // --- SUPABASE CLIENT INTEGRATION ---
  public supabaseClient: SupabaseClient | null = null;
  public isSupabaseConnected = false;

  public async initSupabase(): Promise<boolean> {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        this.supabaseClient = createClient(url, key);
        const { error } = await this.supabaseClient.from('categories').select('id').limit(1);
        this.isSupabaseConnected = !error;
        console.log(`✅ [Supabase Client Active] Connected to project: ${url}`);
        return true;
      } catch (err: any) {
        console.warn(`⚠️ [Supabase Client Notice]: ${err.message}`);
        return false;
      }
    }
    return false;
  }

  public async query(text: string, params?: any[]) {
    if (this.pgPool && this.isConnectedToPostgres) {
      return this.pgPool.query(text, params);
    }
    return null;
  }
}

export const db = new DatabaseEngine();
// Automatically initialize Supabase and PostgreSQL connections
db.initSupabase().catch(() => {});
db.initPostgresConnection().catch(() => {});


