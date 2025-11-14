import React from 'react';

interface SearchSuggestionsProps {
    onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
    "Cozy bookstores with cafes",
    "Rooftop bars with a view",
    "Insta-worthy brunch spots",
    "Secluded beaches for sunset",
    "Artisan coffee shops",
    "Quiet parks for a picnic",
    "Vintage record stores",
    "Authentic street food stalls",
    "Gardens or arboretums",
    "Unique photo opportunities"
];

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ onSuggestionClick }) => {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-2">Try searching:</p>
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="px-3 py-1 text-sm text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-900/40 rounded-full transition-all duration-200 hover:bg-teal-200/80 dark:hover:bg-teal-900/70 hover:scale-105 active:scale-95"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
};