import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Order } from '../../types/index.ts';

interface CheckoutModalProps {
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, tax, total, refreshCart } = useCart();
  const { user } = useAuth();

  const [billingName, setBillingName] = useState(user?.fullName || 'Marcus Reed');
  const [billingEmail, setBillingEmail] = useState(user?.email || 'buyer@artvault.io');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [licenseAgreed, setLicenseAgreed] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName || !billingEmail) {
      setErrorMessage('Please provide your legal billing name and email for the license certificate.');
      return;
    }
    if (!licenseAgreed) {
      setErrorMessage('You must acknowledge the digital licensing terms to proceed.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      const res = await api.checkout({
        billingName,
        billingEmail,
        paymentMethod: 'credit_card',
      });

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#D97706', '#FBBF24', '#ffffff'],
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }

      await refreshCart();
      onOrderSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-[#0E0E15] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-display font-bold text-white">Secure Digital Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Order Summary Strip */}
          <div className="p-4 rounded-xl bg-[#14141E] border border-white/[0.06] space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Items in Order:</span>
              <span className="font-semibold text-white">{items.length} Digital Asset(s)</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Tax (8%):</span>
              <span className="font-mono text-white tabular-nums">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.08]">
              <span>Total Payable:</span>
              <span className="font-mono text-amber-400 tabular-nums">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              1. Licensee Billing Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400">Legal Name / Studio</label>
                <input
                  type="text"
                  required
                  value={billingName}
                  onChange={(e) => setBillingName(e.target.value)}
                  placeholder="e.g. Marcus Reed"
                  className="w-full bg-[#161622] border border-white/[0.1] focus:border-amber-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400">Email for Delivery</label>
                <input
                  type="email"
                  required
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="buyer@artvault.io"
                  className="w-full bg-[#161622] border border-white/[0.1] focus:border-amber-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simulated Payment Card Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                2. Payment Method
              </h4>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                Test Sandbox Active
              </span>
            </div>

            <div className="space-y-3 bg-[#14141E] p-4 rounded-xl border border-white/[0.08]">
              <div className="space-y-1 text-xs">
                <label className="text-neutral-400">Card Number</label>
                <div className="relative flex items-center">
                  <CreditCard className="absolute left-3 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#0D0D13] border border-white/[0.1] focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-neutral-400">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#0D0D13] border border-white/[0.1] focus:border-amber-500 rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#0D0D13] border border-white/[0.1] focus:border-amber-500 rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Licensing Agreement Checkbox */}
          <div className="flex items-start gap-2 text-xs text-neutral-400">
            <input
              type="checkbox"
              id="license-terms"
              checked={licenseAgreed}
              onChange={(e) => setLicenseAgreed(e.target.checked)}
              className="mt-0.5 accent-amber-500 rounded cursor-pointer"
            />
            <label htmlFor="license-terms" className="cursor-pointer leading-tight">
              I agree to the ArtVault Perpetual Digital Licensing terms and acknowledge that unlocked tokens will be bound to my account library.
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Validating & Issuing Digital Tokens...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Authorize & Unlock Assets · ${total.toFixed(2)}</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
