import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye, Layers } from 'lucide-react';
import { Artwork } from '../../types/index.ts';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  onOpenAuth: () => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onSelect,
  onOpenAuth,
}) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const favorited = isWishlisted(artwork.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    toggleWishlist(artwork.id);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(artwork.id, 'personal');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(artwork)}
      className="group relative flex flex-col bg-[#111117] border border-white/[0.08] hover:border-amber-500/40 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5),0_0_24px_rgba(245,158,11,0.12)]"
    >
      {/* Visual Asset Container (70% Height proportion) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0E]">
        {!imageError ? (
          <img
            src={artwork.thumbnailUrl}
            alt={artwork.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1E28] to-[#121218] p-4 text-center">
            <Layers className="w-8 h-8 text-amber-500/60 mb-2" />
            <span className="text-xs font-mono text-neutral-400 line-clamp-1">{artwork.title}</span>
            <span className="text-[10px] text-neutral-500 mt-1">{artwork.fileFormats}</span>
          </div>
        )}

        {/* Ambient Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111117] via-transparent to-black/30 pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Floating Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={favorited ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            favorited
              ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
              : 'bg-black/60 text-white hover:text-amber-400 hover:bg-black/80'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick format indicator on bottom left */}
        <div className="absolute bottom-2.5 left-3 text-[11px] font-mono text-neutral-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
          {artwork.fileFormats.split(',')[0]}
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Clean Metadata with '·' separator (Anti-Slop Zero Pill Rule) */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 truncate mb-1">
            <span className="text-amber-400/90 font-medium">{artwork.categoryName || 'Digital'}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="truncate">{artwork.artistName}</span>
          </div>

          <h3 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors line-clamp-1 leading-snug">
            {artwork.title}
          </h3>
        </div>

        {/* Price Baseline & Rating */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
          
          {/* Price */}
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block font-mono">Personal</span>
            <span className="font-mono text-sm font-bold text-white tabular-nums">
              ${artwork.basePricePersonal.toFixed(2)}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-neutral-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono font-medium text-xs tabular-nums">
              {artwork.averageRating > 0 ? artwork.averageRating.toFixed(1) : 'New'}
            </span>
            {artwork.reviewCount > 0 && (
              <span className="text-[10px] text-neutral-500">
                ({artwork.reviewCount})
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            aria-label="Add to cart"
            className="p-1.5 bg-white/[0.05] hover:bg-amber-400 hover:text-black rounded-lg text-neutral-300 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  );
};
