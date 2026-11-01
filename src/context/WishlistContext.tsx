import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface WishlistContextType {
  items: WishlistItem[];
  wishlistIds: Set<number>;
  isLoading: boolean;
  toggleWishlist: (artworkId: number) => Promise<boolean>;
  isWishlisted: (artworkId: number) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.getWishlist();
      const list = data.items || [];
      setItems(list);
      setWishlistIds(new Set(list.map((w: any) => w.artworkId)));
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated, user?.id]);

  const toggleWishlist = async (artworkId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;

    // Optimistic toggle
    const nextIds = new Set(wishlistIds);
    const willWishlist = !nextIds.has(artworkId);
    if (willWishlist) {
      nextIds.add(artworkId);
    } else {
      nextIds.delete(artworkId);
    }
    setWishlistIds(nextIds);

    try {
      const res = await api.toggleWishlist(artworkId);
      await refreshWishlist();
      return res.wishlisted;
    } catch (e) {
      console.error('Toggle wishlist failed:', e);
      // Rollback
      await refreshWishlist();
      return !willWishlist;
    }
  };

  const isWishlisted = (artworkId: number) => wishlistIds.has(artworkId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistIds,
        isLoading,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
