import React from 'react';
import { Box, Image, PenTool, Grid, Sparkles, LayoutGrid } from 'lucide-react';
import { Category } from '../../types/index.ts';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  totalArtworksCount: number;
}

const iconMap: Record<string, React.ReactNode> = {
  Box: <Box className="w-4 h-4" />,
  Image: <Image className="w-4 h-4" />,
  PenTool: <PenTool className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  totalArtworksCount,
}) => {
  return (
    <div className="w-full border-b border-white/[0.08] bg-[#0B0B10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          
          {/* "All Vault" Tab */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              selectedCategorySlug === 'all'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Categories</span>
            <span className="text-[11px] font-mono text-neutral-500">
              ({totalArtworksCount})
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {iconMap[cat.iconName] || <Box className="w-4 h-4" />}
                <span>{cat.name}</span>
                {cat.artworkCount !== undefined && (
                  <span className="text-[11px] font-mono text-neutral-500">
                    ({cat.artworkCount})
                  </span>
                )}
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
};
