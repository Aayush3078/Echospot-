import React, { forwardRef } from 'react';
import type { Source, Place, Location, Review, PlaceCategory } from '../types';
import { MapDisplay } from './MapDisplay';
import { FilterBar } from './FilterBar';

interface ResultsDisplayProps {
  isLoading: boolean;
  result: { text: string; sources: Source[]; places: Place[] } | null;
  error: string | null;
  userLocation: Location | null;
  theme: 'light' | 'dark';
  favorites: Place[];
  onToggleFavorite: (place: Place) => void;
  highlightedPlace: Place | null;
  onHighlightClear: () => void;
  onPlaceSelected: (place: Place) => void;
  reviewsForPlace: (placeId: string) => Review[];
  onAddReview: (placeId: string, review: Review) => void;
  activeFilters: PlaceCategory[];
  onToggleFilter: (category: PlaceCategory) => void;
}

const NoResultsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const ResultsDisplay = forwardRef<HTMLDivElement, ResultsDisplayProps>(({ 
    isLoading, 
    result, 
    error, 
    userLocation,
    theme, 
    favorites, 
    onToggleFavorite,
    highlightedPlace,
    onHighlightClear,
    onPlaceSelected,
    reviewsForPlace,
    onAddReview,
    activeFilters,
    onToggleFilter
}, ref) => {
  // Loading state is now handled by the global LoadingBar, so we don't render a spinner here.
  // We still want to show an error message if one occurs.
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
        <h3 className="font-semibold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Don't render anything if there are no results yet (and not loading).
  if (!result) {
    return null;
  }

  const renderText = (text: string) => {
    // This removes the structured place info from the main text body to avoid duplication
    const cleanedText = text.split('###')[0].trim();
    return cleanedText.split('\n').map((paragraph, index) => {
      let currentParagraph = paragraph.trim();
      if(currentParagraph === '') return null;
      return <p key={index} className="mb-4">{currentParagraph}</p>;
    });
  };

  const hasPlacesAfterFilter = result.places && result.places.length > 0;
  const wasSearchSuccessful = result.text.trim() !== '' || result.places.length > 0;

  return (
    <div ref={ref} className="mt-6 space-y-6 scroll-mt-24">
      <FilterBar activeFilters={activeFilters} onToggleFilter={onToggleFilter} />
      
      {userLocation && wasSearchSuccessful && (
         <MapDisplay
            center={[userLocation.latitude, userLocation.longitude]}
            places={result.places}
            theme={theme}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            highlightedPlace={highlightedPlace}
            onHighlightClear={onHighlightClear}
            onPlaceSelected={onPlaceSelected}
            reviewsForPlace={reviewsForPlace}
            onAddReview={onAddReview}
            userLocation={userLocation}
          />
      )}
      
      {!hasPlacesAfterFilter && wasSearchSuccessful && (
         <div className="text-center p-8 bg-gray-100 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 animate-fadeInUp">
            <NoResultsIcon />
            <p className="mt-4 font-semibold text-gray-600 dark:text-gray-300">No Matches Found</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
        </div>
      )}
     
      {wasSearchSuccessful && (
        <div className="p-6 bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="prose prose-gray dark:prose-invert max-w-none">
              {renderText(result.text)}
          </div>
          {result.sources.length > 0 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">Sources:</h4>
              <ul className="space-y-2">
                {result.sources.map((source, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                  >
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${source.type === 'maps' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>{source.type === 'maps' ? 'Map' : 'Web'}</span>
                    <a
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors underline break-all"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
ResultsDisplay.displayName = 'ResultsDisplay';