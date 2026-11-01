import React from 'react';
import { Heart, ArrowLeft, Trash2, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { Artwork } from '../../types/index.ts';

interface SavedCollectionsViewProps {
  onBackToCatalog: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
}

export const SavedCollectionsView: React.FC<SavedCollectionsViewProps> = ({
  onBackToCatalog,
  onSelectArtwork,
}) => {
  const { items, toggleWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <button
            onClick={onBackToCatalog}
            className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalogue</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            <span>Saved Collections</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Bookmarked digital art items saved for future studio acquisitions or production sprints.
          </p>
        </div>

        <div className="font-mono text-xs text-neutral-400">
          Saved Assets: <span className="text-amber-400 font-bold">{items.length}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          Loading saved collection...
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#111117] rounded-2xl border border-white/[0.06] p-8">
          <Heart className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Saved Artworks Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Click the heart icon on any artwork card in the catalogue to save it to your private collection.
          </p>
          <button
            onClick={onBackToCatalog}
            className="mt-3 px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Explore the Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const art = item.artwork;
            if (!art) return null;

            return (
              <div
                key={item.id}
                className="group bg-[#111117] border border-white/[0.08] hover:border-amber-500/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  <div 
                    onClick={() => onSelectArtwork(art)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 cursor-pointer"
                  >
                    <img
                      src={art.thumbnailUrl}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(art.id);
                        }}
                        className="p-2 rounded-full bg-black/70 hover:bg-red-500/20 text-red-400 border border-white/10 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-xs text-amber-400/90 font-mono">
                      {art.categoryName || 'Digital Art'}
                    </div>
                    <h3 
                      onClick={() => onSelectArtwork(art)}
                      className="font-semibold text-white text-sm hover:text-amber-200 cursor-pointer line-clamp-1"
                    >
                      {art.title}
                    </h3>
                    <p className="text-xs text-neutral-400">By {art.artistName}</p>
                    <p className="font-mono text-xs text-neutral-500">Format: {art.fileFormats}</p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 font-mono block">From</span>
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      ${art.basePricePersonal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectArtwork(art)}
                      className="p-2 text-neutral-400 hover:text-white bg-[#1A1A24] rounded-lg transition-colors"
                      title="Inspect Specs"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => addToCart(art.id, 'personal')}
                      className="px-3 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
