import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Hero } from './components/layout/Hero.tsx';
import { CategoryTabs } from './components/artwork/CategoryTabs.tsx';
import { FilterSidebar } from './components/artwork/FilterSidebar.tsx';
import { SortBar } from './components/artwork/SortBar.tsx';
import { ArtworkCard } from './components/artwork/ArtworkCard.tsx';
import { ArtworkDetailModal } from './components/artwork/ArtworkDetailModal.tsx';
import { CartDrawer } from './components/checkout/CartDrawer.tsx';
import { CheckoutModal } from './components/checkout/CheckoutModal.tsx';
import { OrderReceiptModal } from './components/checkout/OrderReceiptModal.tsx';
import { MyLibraryView } from './components/library/MyLibraryView.tsx';
import { SavedCollectionsView } from './components/library/SavedCollectionsView.tsx';
import { AdminDashboardView } from './components/admin/AdminDashboardView.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { DatabaseStatusModal } from './components/common/DatabaseStatusModal.tsx';
import { Artwork, Category, Order } from './types/index.ts';
import { api } from './services/api.ts';
import { Sparkles, Layers, ShieldCheck, Download, ChevronRight } from 'lucide-react';

function MarketplaceApp() {
  const { user, isAdmin } = useAuth();
  const catalogRef = useRef<HTMLDivElement>(null);

  // Navigation View State
  const [activeView, setActiveView] = useState<'catalog' | 'library' | 'saved' | 'admin'>('catalog');

  // Modals State
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Catalog Data & Filters State
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'top_rated'>('newest');

  // Load Categories
  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Artworks based on active filters
  const fetchArtworks = async () => {
    try {
      setIsLoadingArtworks(true);
      const res = await api.getArtworks({
        category: selectedCategorySlug !== 'all' ? selectedCategorySlug : undefined,
        search: searchQuery.trim() || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 150 ? maxPrice : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy,
        limit: 24,
      });
      setArtworks(res.items || []);
      setTotalCount(res.total || 0);
    } catch (e) {
      console.error('Failed to fetch artworks:', e);
    } finally {
      setIsLoadingArtworks(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArtworks();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategorySlug, minPrice, maxPrice, minRating, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategorySlug('all');
    setMinPrice(0);
    setMaxPrice(150);
    setMinRating(0);
    setSortBy('newest');
  };

  const handleArtworkUpdated = (updated: Artwork) => {
    setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedArtwork(updated);
  };

  const featuredArtwork = useMemo(() => {
    return artworks.find((a) => a.isFeatured) || artworks[0];
  }, [artworks]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Main Content Routing */}
      <main className="flex-1">
        {activeView === 'catalog' && (
          <>
            {/* Hero Section */}
            <Hero
              featuredArtwork={featuredArtwork}
              onSelectArtwork={(art) => setSelectedArtwork(art)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreClick={scrollToCatalog}
            />

            {/* Category Filter Tabs */}
            <CategoryTabs
              categories={categories}
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
              totalArtworksCount={totalCount}
            />

            {/* Catalogue Grid & Filter Sidebar */}
            <div ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left: Filter Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  <FilterSidebar
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    setMinPrice={setMinPrice}
                    setMaxPrice={setMaxPrice}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    onReset={handleResetFilters}
                  />

                  {/* Curated Guarantee Box */}
                  <div className="bg-[#12121A] border border-white/[0.06] rounded-xl p-4 text-xs text-neutral-400 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Studio-Grade Verification</span>
                    </div>
                    <p className="leading-relaxed">
                      Every mesh, shader tree, and matte painting is vetted for clean topology, UV layout, and license authenticity.
                    </p>
                  </div>
                </div>

                {/* Right: Artwork Grid */}
                <div className="lg:col-span-3 space-y-6">
                  <SortBar
                    totalCount={totalCount}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />

                  {isLoadingArtworks ? (
                    <div className="py-24 text-center text-xs text-neutral-500">
                      Loading curated digital assets...
                    </div>
                  ) : artworks.length === 0 ? (
                    <div className="py-20 text-center space-y-3 bg-[#111117] rounded-2xl border border-white/[0.06] p-8">
                      <p className="font-semibold text-white">No digital art matches your criteria</p>
                      <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                        Try clearing search terms or expanding price and rating filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artworks.map((artwork) => (
                        <ArtworkCard
                          key={artwork.id}
                          artwork={artwork}
                          onSelect={(art) => setSelectedArtwork(art)}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}

        {/* View: My Library */}
        {activeView === 'library' && (
          <MyLibraryView onBackToCatalog={() => setActiveView('catalog')} />
        )}

        {/* View: Saved Collections */}
        {activeView === 'saved' && (
          <SavedCollectionsView
            onBackToCatalog={() => setActiveView('catalog')}
            onSelectArtwork={(art) => setSelectedArtwork(art)}
          />
        )}

        {/* View: Admin Console */}
        {activeView === 'admin' && (
          <AdminDashboardView
            onBackToCatalog={() => setActiveView('catalog')}
            categories={categories}
            onRefreshCategories={fetchCategories}
          />
        )}
      </main>

      {/* 3. Global Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07070A] py-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="font-display font-bold text-white text-base">ArtVault</span>
              </div>
              <p className="text-neutral-400 max-w-md">
                Production-grade digital art marketplace built with the PERN stack. Perpetual licensing, high-density files, and instant cryptographic asset fulfillment.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-neutral-400">
              <div>
                <span className="text-white font-semibold block mb-2">Supported Formats</span>
                <span className="text-[11px] font-mono">BLEND · FBX · GLTF · PSD · ASEPRITE · GLSL</span>
              </div>
              <div>
                <span className="text-white font-semibold block mb-2">Licensing Protocol</span>
                <span className="text-[11px]">Personal & Commercial Rights with SHA-256 Certificates</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 ArtVault Marketplace Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="hover:text-amber-400 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>PostgreSQL & Environment Status</span>
              </button>
              <span>·</span>
              <span>Express REST Engine</span>
              <span>·</span>
              <span>React 19 & Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. Sliding Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* 5. Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={(order) => {
            setIsCheckoutOpen(false);
            setCompletedOrder(order);
          }}
        />
      )}

      {/* 6. Order Receipt Modal */}
      {completedOrder && (
        <OrderReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onGoToLibrary={() => {
            setCompletedOrder(null);
            setActiveView('library');
          }}
        />
      )}

      {/* 7. Artwork Detail Modal */}
      {selectedArtwork && (
        <ArtworkDetailModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onArtworkUpdated={handleArtworkUpdated}
        />
      )}

      {/* 8. Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* 9. Database & Environment Status Modal */}
      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MarketplaceApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
