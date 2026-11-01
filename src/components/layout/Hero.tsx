import React from 'react';
import { Search, Download, ShieldCheck, Layers, ArrowUpRight } from 'lucide-react';
import { Artwork } from '../../types/index.ts';

interface HeroProps {
  featuredArtwork?: Artwork;
  onSelectArtwork: (artwork: Artwork) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  featuredArtwork,
  onSelectArtwork,
  searchQuery,
  setSearchQuery,
  onExploreClick,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#09090D] via-[#0E0E14] to-[#09090D] pt-12 pb-16 border-b border-white/[0.06]">
      {/* Warm Ambient Gallery Glow Behind Hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-600/10 via-amber-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Search, Value Propositions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Ambient editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-amber-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              <span>Curated Digital Vault · Perpetual Licensing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.08] text-balance">
              Museum-grade digital assets for visionary creators.
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 font-normal max-w-xl leading-relaxed">
              Acquire production-ready 3D environments, layered matte paintings, procedural shaders, and game sprites with transparent personal & commercial rights.
            </p>

            {/* Quick Search Bar */}
            <div className="relative max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets by title, artist, file format (e.g. BLEND, PSD, GLTF)..."
                  className="w-full pl-12 pr-28 py-3.5 bg-[#14141C] border border-white/[0.12] hover:border-amber-500/40 focus:border-amber-500 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
                />
                <button
                  onClick={onExploreClick}
                  className="absolute right-2 px-4 py-2 text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  Find Art
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Instant Unlocked Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Verifiable License Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Master Layered Files</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Spotlight Artwork Card */}
          <div className="lg:col-span-5">
            {featuredArtwork && (
              <div 
                onClick={() => onSelectArtwork(featuredArtwork)}
                className="group relative cursor-pointer bg-[#13131B] border border-white/[0.12] hover:border-amber-500/50 rounded-2xl p-3 shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                {/* Spotlight Artwork Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900">
                  <img
                    src={featuredArtwork.thumbnailUrl}
                    alt={featuredArtwork.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle warm ambient lighting overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                        Featured Showcase
                      </span>
                      <p className="text-white font-display font-semibold text-base mt-1 line-clamp-1">
                        {featuredArtwork.title}
                      </p>
                    </div>

                    <div className="bg-amber-500 text-black p-2 rounded-lg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Metadata Strip */}
                <div className="pt-3 px-1 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-neutral-300 font-medium">{featuredArtwork.artistName}</span>
                    <span>·</span>
                    <span className="text-neutral-500">{featuredArtwork.fileFormats.split(',')[0]}</span>
                  </div>

                  <div className="font-mono font-bold text-amber-400 tabular-nums">
                    From ${featuredArtwork.basePricePersonal.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
