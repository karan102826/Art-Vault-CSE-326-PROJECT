import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    itemCount, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    updateLicense, 
    removeFromCart, 
    clearCart 
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D0D13] border-l border-white/[0.12] shadow-2xl flex flex-col justify-between text-neutral-200">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-display font-bold text-white">Your Digital Bag</h2>
              <span className="font-mono text-xs text-neutral-400">({itemCount})</span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-3">
                <ShoppingBag className="w-12 h-12 text-neutral-600 stroke-[1.5]" />
                <p className="font-medium text-white">Your digital vault is empty</p>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Browse the curated catalog to acquire 3D assets, concept art, and shader packs.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                {items.map((item) => {
                  const art = item.artwork;
                  if (!art) return null;
                  const itemPrice = item.licenseTier === 'commercial' ? art.priceCommercial : art.basePricePersonal;

                  return (
                    <div 
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#14141E] border border-white/[0.06] space-y-3"
                    >
                      <div className="flex gap-3">
                        <img
                          src={art.thumbnailUrl}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-lg object-cover bg-neutral-900 border border-white/[0.08]"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{art.title}</h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{art.artistName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                              ${itemPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.artworkId)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* License Tier Selector inside Cart */}
                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-neutral-400">License:</span>
                        <div className="flex items-center gap-1 bg-[#0D0D13] p-0.5 rounded-lg border border-white/[0.08]">
                          <button
                            onClick={() => updateLicense(item.artworkId, 'personal')}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              item.licenseTier === 'personal'
                                ? 'bg-amber-500 text-black font-semibold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            Personal (${art.basePricePersonal.toFixed(0)})
                          </button>
                          <button
                            onClick={() => updateLicense(item.artworkId, 'commercial')}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              item.licenseTier === 'commercial'
                                ? 'bg-amber-500 text-black font-semibold'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            Commercial (${art.priceCommercial.toFixed(0)})
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/[0.08] bg-[#101017] space-y-4">
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Digital VAT / State Tax (8%)</span>
                  <span className="font-mono text-white tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.06]">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400 tabular-nums text-base">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Immediate tokenized ZIP download & legal certificate upon checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
