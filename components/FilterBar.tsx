import React from 'react';
import { PlaceCategory, PLACE_CATEGORIES } from '../types';

interface FilterBarProps {
  activeFilters: PlaceCategory[];
  onToggleFilter: (category: PlaceCategory) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilters, onToggleFilter }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-3 bg-white/60 dark:bg-gray-950/60 rounded-xl backdrop-blur-sm border border-gray-200 dark:border-gray-800">
      {PLACE_CATEGORIES.map(category => {
        const isActive = activeFilters.includes(category);
        return (
          <button
            key={category}
            onClick={() => onToggleFilter(category)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 transform
              ${
              isActive
                ? 'bg-teal-500 text-white shadow-md scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-pressed={isActive}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        );
      })}
    </div>
  );
};