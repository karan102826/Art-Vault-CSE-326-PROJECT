import React, { useState, useEffect } from 'react';
import { 
  X, Star, Heart, ShoppingBag, Check, Shield, FileText, 
  Layers, HardDrive, Maximize2, Send, AlertCircle 
} from 'lucide-react';
import { Artwork, LicenseTier, Review } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

interface ArtworkDetailModalProps {
  artwork: Artwork;
  onClose: () => void;
  onOpenAuth: () => void;
  onArtworkUpdated?: (updated: Artwork) => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  onClose,
  onOpenAuth,
  onArtworkUpdated,
}) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [selectedTier, setSelectedTier] = useState<LicenseTier>('personal');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const favorited = isWishlisted(artwork.id);
  const currentPrice = selectedTier === 'commercial' ? artwork.priceCommercial : artwork.basePricePersonal;

  const images = artwork.previewImages && artwork.previewImages.length > 0 
    ? artwork.previewImages 
    : [artwork.thumbnailUrl];

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoadingReviews(true);
        const res = await api.getReviews(artwork.id);
        setReviews(res.reviews || []);
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
      } finally {
        setIsLoadingReviews(false);
      }
    }
    loadReviews();
  }, [artwork.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(artwork.id, selectedTier);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (newComment.trim().length < 5) {
      setReviewError('Please write at least 5 characters in your review');
      return;
    }

    setReviewError('');
    setIsSubmittingReview(true);
    try {
      const res = await api.addReview(artwork.id, newRating, newComment);
      setReviews(res.reviews);
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);

      if (res.updatedArtwork && onArtworkUpdated) {
        onArtworkUpdated({
          ...artwork,
          averageRating: res.updatedArtwork.averageRating,
          reviewCount: res.updatedArtwork.reviewCount,
        });
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl bg-[#0D0D13] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden my-6 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-neutral-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Visual Gallery & Specs */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/[0.08] space-y-6">
            
            {/* Primary High-Res Preview */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/80 border border-white/[0.08] group">
              <img
                src={images[activeImageIndex] || artwork.thumbnailUrl}
                alt={artwork.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-[11px] font-mono text-amber-300 px-2.5 py-1 rounded">
                Preview {activeImageIndex + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnail Switcher (if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Artwork Synopsis</h4>
              <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                {artwork.description}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Asset Specifications</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#14141E] p-3 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono text-[10px] uppercase">File Formats</span>
                  </div>
                  <span className="font-semibold text-white block truncate">{artwork.fileFormats}</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono text-[10px] uppercase">Native Resolution</span>
                  </div>
                  <span className="font-semibold text-white block truncate">{artwork.resolution}</span>
                </div>

                <div className="bg-[#14141E] p-3 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono text-[10px] uppercase">Archive Size</span>
                  </div>
                  <span className="font-semibold text-white block font-mono tabular-nums">
                    {artwork.fileSizeMb.toFixed(1)} MB Uncompressed
                  </span>
                </div>
              </div>
            </div>

            {/* Artist Profile Section */}
            <div className="pt-4 border-t border-white/[0.08] flex items-start gap-3">
              <img
                src={artwork.artistAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'}
                alt={artwork.artistName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
              />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Creator & Technical Artist</span>
                <p className="text-sm font-semibold text-white">{artwork.artistName}</p>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  {artwork.artistBio || 'Verified digital artist and asset developer contributing to the ArtVault curated collection.'}
                </p>
              </div>
            </div>

            {/* Verified Reviews Module */}
            <div className="pt-6 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <span>Collector Reviews</span>
                  <span className="text-xs font-mono font-normal text-neutral-400">
                    ({reviews.length})
                  </span>
                </h4>
                <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{artwork.averageRating > 0 ? artwork.averageRating.toFixed(2) : '5.00'}</span>
                </div>
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="bg-[#14141E] p-4 rounded-xl border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300">Submit a Verified Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share feedback on topology, UV maps, rendering speed, or shaders..."
                    className="w-full bg-[#0D0D13] border border-white/[0.12] focus:border-amber-500 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Review recorded! Aggregate rating updated.</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Review</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {isLoadingReviews ? (
                  <p className="text-xs text-neutral-500">Loading collector feedback...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">Be the first verified collector to review this asset.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#12121A] p-3 rounded-lg border border-white/[0.04] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-200">{rev.userName}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">
                            Verified Purchase
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-neutral-400 text-xs leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 p-6 bg-[#0E0E14] flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                  {artwork.categoryName}
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                  {artwork.title}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  By <span className="text-neutral-200 font-medium">{artwork.artistName}</span>
                </p>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-4 rounded-xl bg-[#14141F] border border-white/[0.08]">
                <span className="text-[11px] font-mono uppercase text-neutral-400 block">
                  Selected License Price
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-display font-extrabold text-white font-mono tabular-nums">
                    ${currentPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400">USD + tax</span>
                </div>
              </div>

              {/* License Tier Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
                  Select License Tier
                </label>

                {/* Personal Tier Button */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('personal')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedTier === 'personal'
                      ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-[#14141E] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">Personal License</span>
                    <span className="font-mono font-bold text-sm text-amber-400 tabular-nums">
                      ${artwork.basePricePersonal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    Private study, non-monetized portfolio showcases, and educational research.
                  </p>
                </button>

                {/* Commercial Tier Button */}
                <button
                  type="button"
                  onClick={() => setSelectedTier('commercial')}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedTier === 'commercial'
                      ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-[#14141E] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">Commercial License</span>
                      <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                        Full Rights
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-amber-400 tabular-nums">
                      ${artwork.priceCommercial.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-snug">
                    Worldwide perpetual distribution in commercial games, film VFX, client work, and broadcasts.
                  </p>
                </button>
              </div>

              {/* Guarantees List */}
              <div className="space-y-2 pt-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Instant archive token & direct ZIP dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Includes verifiable SHA-256 License Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Free perpetual updates & re-downloads</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="space-y-3 pt-6 border-t border-white/[0.08]">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    addedSuccess
                      ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/25'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart · ${currentPrice.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) onOpenAuth();
                    else toggleWishlist(artwork.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    favorited
                      ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-[#151520] text-neutral-300 border-white/[0.12] hover:text-white hover:border-white/30'
                  }`}
                  aria-label="Wishlist artwork"
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-[11px] text-center text-neutral-500">
                Digital transactions protected with 256-bit SSL encryption.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
