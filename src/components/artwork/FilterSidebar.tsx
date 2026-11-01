import React from 'react';
import { SlidersHorizontal, Star, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (val: number) => void;
  setMaxPrice: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onReset,
}) => {
  return (
    <div className="bg-[#111117] border border-white/[0.08] rounded-xl p-5 space-y-6 text-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-white font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
          Price Range (USD)
        </label>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#181822] border border-white/[0.08] rounded-lg px-2.5 py-1.5 flex items-center">
            <span className="text-neutral-500 text-xs mr-1">$</span>
            <input
              type="number"
              min={0}
              max={maxPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
              placeholder="0"
            />
          </div>
          <span className="text-neutral-500 text-xs">to</span>
          <div className="flex-1 bg-[#181822] border border-white/[0.08] rounded-lg px-2.5 py-1.5 flex items-center">
            <span className="text-neutral-500 text-xs mr-1">$</span>
            <input
              type="number"
              min={minPrice}
              max={250}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.min(250, Number(e.target.value)))}
              className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
              placeholder="150"
            />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={150}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-500 h-1.5 bg-[#252535] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-neutral-500">
          <span>$0</span>
          <span>$75</span>
          <span>$150+</span>
        </div>
      </div>

      {/* Minimum Star Rating */}
      <div className="space-y-3 pt-3 border-t border-white/[0.08]">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 block">
          Minimum Rating
        </label>
        
        <div className="space-y-1.5">
          {[
            { label: 'All Ratings', value: 0 },
            { label: '4.5 Stars & Up', value: 4.5 },
            { label: '4.0 Stars & Up', value: 4.0 },
            { label: '3.0 Stars & Up', value: 3.0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMinRating(item.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                minRating === item.value
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{item.label}</span>
              {item.value > 0 && (
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono text-[11px]">{item.value}+</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* License Scope Overview Info */}
      <div className="pt-3 border-t border-white/[0.08] text-[11px] text-neutral-400 leading-relaxed bg-[#151520] p-3 rounded-lg">
        <p className="font-semibold text-neutral-300 mb-1">Vault Licensing Guarantee</p>
        <p>Personal tiers cover study and personal showcases. Commercial tiers grant worldwide perpetual commercial distribution rights.</p>
      </div>

    </div>
  );
};
