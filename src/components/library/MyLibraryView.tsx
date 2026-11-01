import React, { useState, useEffect } from 'react';
import { Download, Shield, Library, ArrowLeft, ExternalLink, HardDrive } from 'lucide-react';
import { api } from '../../services/api.ts';
import { LicenseCertificateModal } from './LicenseCertificateModal.tsx';

interface MyLibraryViewProps {
  onBackToCatalog: () => void;
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({ onBackToCatalog }) => {
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);

  useEffect(() => {
    async function loadLibrary() {
      try {
        setIsLoading(true);
        const data = await api.getMyLibrary();
        setLibraryItems(data.libraryItems || []);
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLibrary();
  }, []);

  const handleDownload = (token: string, title: string) => {
    const link = document.createElement('a');
    link.href = `/api/orders/download/${token}`;
    link.download = `ArtVault_${title.replace(/\s+/g, '_')}_Bundle.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
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
            <Library className="w-6 h-6 text-amber-400" />
            <span>My Digital Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Access your acquired master files, cryptographic download tokens, and legal license agreements.
          </p>
        </div>

        <div className="bg-[#14141E] border border-white/[0.08] rounded-xl px-4 py-2.5 flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">Purchased Assets</span>
            <span className="font-bold text-white text-base">{libraryItems.length}</span>
          </div>
          <div className="border-l border-white/[0.08] pl-4">
            <span className="text-neutral-500 block text-[10px] uppercase">Lifetime Orders</span>
            <span className="font-bold text-amber-400 text-base">{orders.length}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          Decrypting your digital library vault...
        </div>
      ) : libraryItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#111117] rounded-2xl border border-white/[0.06] p-8">
          <Library className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Assets in Your Vault Yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Once you acquire digital artwork, your perpetual licenses and download tokens will appear right here.
          </p>
          <button
            onClick={onBackToCatalog}
            className="mt-3 px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Explore the Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraryItems.map((item) => {
            const art = item.artwork;
            if (!art) return null;

            return (
              <div
                key={item.orderItemId}
                className="bg-[#121218] border border-white/[0.08] hover:border-amber-500/30 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-neutral-900">
                    <img
                      src={art.thumbnailUrl}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 uppercase">
                      {item.licenseTier} License
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{art.title}</h3>
                    <p className="text-xs text-neutral-400">By {art.artistName}</p>

                    <div className="text-[11px] font-mono text-neutral-500 space-y-0.5 pt-2">
                      <div>Formats: <span className="text-neutral-300">{art.fileFormats}</span></div>
                      <div>Resolution: <span className="text-neutral-300">{art.resolution}</span></div>
                      <div>Downloads Logged: <span className="text-amber-400">{item.downloadCount} times</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/[0.04] mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCertId(item.orderItemId)}
                    className="flex-1 py-2 px-3 text-xs font-medium text-neutral-300 hover:text-white bg-[#1A1A24] hover:bg-[#222230] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>View License</span>
                  </button>

                  <button
                    onClick={() => handleDownload(item.downloadToken, art.title)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCertId && (
        <LicenseCertificateModal
          orderItemId={selectedCertId}
          onClose={() => setSelectedCertId(null)}
        />
      )}
    </div>
  );
};
