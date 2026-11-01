import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Printer, Check, Copy } from 'lucide-react';
import { api } from '../../services/api.ts';

interface LicenseCertificateModalProps {
  orderItemId: number;
  onClose: () => void;
}

export const LicenseCertificateModal: React.FC<LicenseCertificateModalProps> = ({
  orderItemId,
  onClose,
}) => {
  const [cert, setCert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCert() {
      try {
        setIsLoading(true);
        const data = await api.getCertificate(orderItemId);
        setCert(data);
      } catch (err) {
        console.error('Failed to load certificate:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCert();
  }, [orderItemId]);

  const copyHash = () => {
    if (cert?.verificationHash) {
      navigator.clipboard.writeText(cert.verificationHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-2xl bg-[#0F0F16] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden text-neutral-200 print:border-none print:shadow-none print:text-black print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Border Accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />

        {/* Top Controls */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AUTHENTICATED LICENSE CERTIFICATE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            Generating cryptographic license verification...
          </div>
        ) : cert ? (
          <div className="p-8 space-y-6">
            
            {/* Header Block */}
            <div className="text-center space-y-2 pb-6 border-b border-white/[0.08] print:border-neutral-300">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 print:text-amber-700">
                ArtVault Digital Rights Registry
              </span>
              <h2 className="text-2xl font-display font-bold text-white print:text-black tracking-tight">
                Certificate of Digital License
              </h2>
              <p className="text-xs text-neutral-400 print:text-neutral-600 font-mono">
                Certificate ID: {cert.certificateId}
              </p>
            </div>

            {/* Licensee & Artwork Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#14141E] print:bg-neutral-50 border border-white/[0.06] print:border-neutral-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Registered Licensee</span>
                <p className="font-semibold text-white print:text-black text-sm">{cert.licenseeName}</p>
                <p className="text-neutral-400 print:text-neutral-600 text-[11px] truncate">{cert.licenseeEmail}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14141E] print:bg-neutral-50 border border-white/[0.06] print:border-neutral-200 space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-500">License Tier & Settlement</span>
                <p className="font-semibold text-amber-400 print:text-amber-800 text-sm uppercase">
                  {cert.licenseTier} Usage Rights
                </p>
                <p className="text-neutral-400 print:text-neutral-600 font-mono text-[11px]">
                  Order Ref: {cert.orderNumber}
                </p>
              </div>
            </div>

            {/* Asset Spotlight */}
            <div className="p-4 rounded-xl bg-[#14141E] print:bg-neutral-50 border border-white/[0.06] print:border-neutral-200 flex items-center gap-4">
              <img
                src={cert.artwork.thumbnailUrl}
                alt={cert.artwork.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover bg-neutral-900 border border-white/[0.1]"
              />
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-amber-400">Licensed Digital Asset</span>
                <h4 className="font-semibold text-white print:text-black text-sm">{cert.artwork.title}</h4>
                <p className="text-neutral-400 print:text-neutral-600">
                  By {cert.artwork.artistName} · Format: {cert.artwork.fileFormats}
                </p>
              </div>
            </div>

            {/* Legal Usage Grant */}
            <div className="space-y-2 text-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 print:text-neutral-700">
                Scope of Authorization & Grant
              </span>
              <p className="text-neutral-300 print:text-neutral-700 leading-relaxed bg-[#14141E] print:bg-neutral-50 p-3.5 rounded-xl border border-white/[0.06] print:border-neutral-200">
                {cert.legalRights}
              </p>
            </div>

            {/* SHA-256 Checksum Signature */}
            <div className="p-3.5 rounded-xl bg-[#0A0A0E] print:bg-neutral-100 border border-white/[0.08] print:border-neutral-300 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  SHA-256 Cryptographic License Hash
                </span>
                <button
                  onClick={copyHash}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-mono flex items-center gap-1 print:hidden"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-neutral-400 print:text-neutral-800 break-all bg-black/40 print:bg-white p-2 rounded">
                {cert.verificationHash}
              </p>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-xs text-red-400">
            Certificate records could not be verified.
          </div>
        )}

      </div>
    </div>
  );
};
