import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, LicenseTier } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  addToCart: (artworkId: number, licenseTier?: LicenseTier) => Promise<void>;
  updateLicense: (artworkId: number, licenseTier: LicenseTier) => Promise<void>;
  removeFromCart: (artworkId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setTax(0);
      setTotal(0);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.getCart();
      setItems(data.items || []);
      setSubtotal(data.subtotal || 0);
      setTax(data.tax || 0);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, user?.id]);

  const addToCart = async (artworkId: number, licenseTier: LicenseTier = 'personal') => {
    try {
      await api.addToCart(artworkId, licenseTier);
      await refreshCart();
      setIsDrawerOpen(true);
    } catch (e) {
      console.error('Add to cart failed:', e);
      throw e;
    }
  };

  const updateLicense = async (artworkId: number, licenseTier: LicenseTier) => {
    try {
      await api.updateCartLicense(artworkId, licenseTier);
      await refreshCart();
    } catch (e) {
      console.error('Update license failed:', e);
      throw e;
    }
  };

  const removeFromCart = async (artworkId: number) => {
    try {
      await api.removeFromCart(artworkId);
      await refreshCart();
    } catch (e) {
      console.error('Remove from cart failed:', e);
      throw e;
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
    } catch (e) {
      console.error('Clear cart failed:', e);
      throw e;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        tax,
        total,
        itemCount: items.length,
        isLoading,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        updateLicense,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
