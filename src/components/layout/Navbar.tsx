import React, { useState } from 'react';
import { ShoppingBag, Heart, Library, Shield, LogOut, User, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { useWishlist } from '../../context/WishlistContext.tsx';

interface NavbarProps {
  activeView: 'catalog' | 'library' | 'saved' | 'admin';
  setActiveView: (view: 'catalog' | 'library' | 'saved' | 'admin') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin, logout, quickSwitch } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090D]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveView('catalog')}
          className="flex items-center gap-2.5 text-left text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-shadow">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-display tracking-tight text-xl font-bold bg-gradient-to-r from-white via-neutral-200 to-amber-200/90 bg-clip-text text-transparent">
            ArtVault
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveView('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'catalog' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Explore Catalogue
          </button>
          
          <button
            onClick={() => {
              if (!isAuthenticated) onOpenAuth();
              else setActiveView('library');
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'library' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Library className="w-4 h-4" />
            <span>My Library</span>
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) onOpenAuth();
              else setActiveView('saved');
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'saved' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved ({wishlistIds.size})</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveView('admin')}
              className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-amber-300 ${
                activeView === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-400/80'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary action & User controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Role Switcher Pill (for reviewer convenience) */}
          <div className="hidden lg:flex items-center bg-[#15151E] border border-white/[0.08] rounded-md p-0.5 text-xs">
            <button
              onClick={() => quickSwitch('buyer')}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                user?.role === 'buyer'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => quickSwitch('admin')}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                user?.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Admin View
            </button>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#15151E] hover:bg-[#1E1E2B] border border-white/[0.08] rounded-lg transition-all hover:border-amber-500/40 whitespace-nowrap shrink-0"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="bg-amber-500 text-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile / Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg bg-[#15151E] border border-white/[0.08] hover:border-white/20 transition-colors text-xs text-neutral-300"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80'}
                  alt={user.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-amber-500/40"
                  referrerPolicy="no-referrer"
                />
                <span className="max-w-[100px] truncate hidden sm:inline font-medium text-white">
                  {user.fullName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#121218] border border-white/[0.12] rounded-xl shadow-2xl py-2 z-50 text-xs"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/[0.08]">
                    <p className="font-semibold text-white truncate">{user.fullName}</p>
                    <p className="text-neutral-400 text-[11px] truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      Role: {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveView('library')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] text-neutral-200 flex items-center gap-2"
                  >
                    <Library className="w-4 h-4 text-neutral-400" />
                    My Digital Library
                  </button>

                  <button
                    onClick={() => setActiveView('saved')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] text-neutral-200 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-neutral-400" />
                    Saved Collection
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveView('admin')}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] text-amber-400 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      Admin Control Panel
                    </button>
                  )}

                  <div className="border-t border-white/[0.08] my-1" />

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
