import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortBarProps {
  totalCount: number;
  sortBy: string;
  setSortBy: (sort: any) => void;
}

export const SortBar: React.FC<SortBarProps> = ({
  totalCount,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
      
      {/* Total Result Counter */}
      <div className="text-xs text-neutral-400">
        Showing <span className="font-mono font-semibold text-white">{totalCount}</span> digital art assets
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-neutral-400">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#14141E] border border-white/[0.12] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 font-medium text-xs cursor-pointer"
        >
          <option value="newest">Newest Releases</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="top_rated">Top Rated Collectors' Choice</option>
        </select>
      </div>

    </div>
  );
};
