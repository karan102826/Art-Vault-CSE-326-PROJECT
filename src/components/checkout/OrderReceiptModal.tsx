import React, { useState } from 'react';
import { 
  CheckCircle2, Download, Shield, FileCheck, ArrowRight, 
  ExternalLink, Sparkles 
} from 'lucide-react';
import { Order, OrderItem } from '../../types/index.ts';
import { LicenseCertificateModal } from '../library/LicenseCertificateModal.tsx';

interface OrderReceiptModalProps {
  order: Order;
  onClose: () => void;
  onGoToLibrary: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  onClose,
  onGoToLibrary,
}) => {
  const [selectedCertificateItemId, setSelectedCertificateItemId] = useState<number | null>(null);

  const handleDownload = (token: string, title: string) => {
    // Direct tokenized download
    const link = document.createElement('a');
    link.href = `/api/orders/download/${token}`;
    link.download = `ArtVault_${title.replace(/\s+/g, '_')}_Bundle.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-[#0D0D13] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent p-6 border-b border-white/[0.08] flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ORDER CONFIRMED & LICENSES ISSUED</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white tracking-tight">
                Order Receipt #{order.orderNumber}
              </h3>
              <p className="text-xs text-neutral-400">
                Purchased by <span className="text-neutral-200 font-medium">{order.billingName}</span> ({order.billingEmail})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block">Total Settled</span>
              <span className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Unlocked Digital Assets List */}
          <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono uppercase tracking-wider">Unlocked Digital Assets ({order.items.length})</span>
              <span className="text-amber-400/90 font-mono text-[11px]">Tokens Valid Lifetime</span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => {
                const art = item.artwork;
                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-[#14141E] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={art?.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=128&q=80'}
                        alt={art?.title || 'Asset'}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover bg-neutral-900 border border-white/[0.08]"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{art?.title || 'Digital Asset'}</h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span className="font-mono text-amber-400 uppercase text-[10px] bg-amber-500/10 px-1.5 py-0.2 rounded">
                            {item.licenseTier} License
                          </span>
                          <span>·</span>
                          <span className="font-mono text-neutral-500 text-[11px]">
                            Paid ${item.pricePaid.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate max-w-xs">
                          Token: {item.downloadToken}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCertificateItemId(item.id)}
                        className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>Certificate</span>
                      </button>

                      <button
                        onClick={() => handleDownload(item.downloadToken, art?.title || 'Asset')}
                        className="px-3.5 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ZIP</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/[0.08] bg-[#101017] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Close Receipt
            </button>

            <button
              onClick={() => {
                onClose();
                onGoToLibrary();
              }}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Go to My Digital Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Embedded Certificate Viewer Modal if chosen */}
      {selectedCertificateItemId && (
        <LicenseCertificateModal
          orderItemId={selectedCertificateItemId}
          onClose={() => setSelectedCertificateItemId(null)}
        />
      )}
    </>
  );
};
