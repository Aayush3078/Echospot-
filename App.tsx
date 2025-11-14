import React, { useState, useCallback, useRef, useMemo } from 'react';
import { findHiddenGems } from './services/geminiService';
import type { AppState, Location, Source, Place, PlaceCategory } from './types';
import { Header } from './components/Header';
import { LocationPermission } from './components/LocationPermission';
import { SearchForm } from './components/SearchForm';
import { SearchSuggestions } from './components/SearchSuggestions';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Footer } from './components/Footer';
import { LoadingBar } from './components/LoadingBar';
import { useFavorites } from './hooks/useFavorites';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { useTheme } from './hooks/useTheme';
import { useReviews } from './hooks/useReviews';
import { useAppStatePersistence } from './hooks/useAppStatePersistence';
import { FavoritesPanel } from './components/FavoritesPanel';

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black ${
      isActive
        ? 'border-b-2 border-teal-500 text-teal-500 dark:text-teal-400'
        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

const App: React.FC = () => {
  const {
    appState, setAppState,
    prompt, setPrompt,
    searchMode, setSearchMode,
    locationQuery, setLocationQuery,
    result, setResult,
    activeFilters, setActiveFilters,
    clearSavedState,
  } = useAppStatePersistence();

  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchAfterLocationGrant, setSearchAfterLocationGrant] = useState(false);
  
  const { favorites, toggleFavorite } = useFavorites();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  const { theme, toggleTheme } = useTheme();
  const { reviewsForPlace, addReview } = useReviews();
  
  const [isFavoritesPanelOpen, setIsFavoritesPanelOpen] = useState(false);
  const [highlightedPlace, setHighlightedPlace] = useState<Place | null>(null);

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const handleRequestLocation = useCallback(() => {
    setAppState('requesting_location');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setAppState('location_granted');
        if (searchAfterLocationGrant) {
          const defaultPrompt = "scenic spots, quiet cafes, and secluded parks";
          setPrompt(defaultPrompt);
          performSearch(defaultPrompt, 'near_me', '', newLocation);
          setSearchAfterLocationGrant(false);
        }
      },
      (geoError) => {
        setError(
          'Location access denied. Please enable location services in your browser settings to find hidden gems near you.'
        );
        setAppState('location_denied');
        setSearchAfterLocationGrant(false);
      }
    );
  }, [setAppState, setLocation, setError, searchAfterLocationGrant, setPrompt]);

  const performSearch = useCallback(async (currentPrompt: string, mode: 'near_me' | 'specific_location', query: string, searchLocationOverride: Location | null = null) => {
    const effectiveLocation = searchLocationOverride || location;
    if (mode === 'near_me' && !effectiveLocation) {
        setError("We need your location to find gems near you. Please grant access.");
        setAppState('location_denied');
        return;
    }
    if (mode === 'specific_location' && (!currentPrompt.trim() || !query.trim())) return;
    if (mode === 'near_me' && !currentPrompt.trim()) {
        currentPrompt = "interesting and unique spots";
    }

    setAppState('loading');
    setError(null);
    setResult(null);
    setActiveFilters([]);
    clearSavedState();

    try {
      const searchLocation = mode === 'near_me' ? effectiveLocation : null;
      const apiResult = await findHiddenGems(currentPrompt, searchLocation, query);
      setResult(apiResult);
      setAppState('results_found');
      setTimeout(() => {
        resultsContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e: unknown)      {
      console.error(e);
      let errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.';
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY") || errorMessage.includes("Requested entity was not found")) {
        errorMessage = "There was an issue with the API configuration. Please ensure your API key is valid and has the necessary permissions.";
      }
      setError(errorMessage);
      setAppState('error');
    }
  }, [location, setAppState, setResult, setActiveFilters, clearSavedState]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch(prompt, searchMode, locationQuery);
  };
  
  const handleUseMyLocationSearch = useCallback(() => {
    setSearchMode('near_me');
    if (location) {
        const defaultPrompt = "scenic spots, quiet cafes, and secluded parks";
        setPrompt(defaultPrompt);
        performSearch(defaultPrompt, 'near_me', '');
    } else {
        setSearchAfterLocationGrant(true);
        handleRequestLocation();
    }
  }, [location, performSearch, handleRequestLocation, setPrompt, setSearchMode]);

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    performSearch(suggestion, searchMode, locationQuery);
  };

  const handlePlaceSelected = (place: Place) => {
    addRecentlyViewed(place);
  };
  
  const handleSelectFavorite = (place: Place) => {
    setHighlightedPlace(place);
    setIsFavoritesPanelOpen(false);
    if (resultsContainerRef.current) {
        resultsContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleFilter = (category: PlaceCategory) => {
    setActiveFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const isLoading = appState === 'loading';

  const filteredResult = useMemo(() => {
    if (!result) return null;
    if (activeFilters.length === 0) return result;
    return {
      ...result,
      places: result.places.filter(place => activeFilters.includes(place.category)),
    };
  }, [result, activeFilters]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-black text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <LoadingBar isLoading={isLoading} />
      <Header 
        favoritesCount={favorites.length}
        onShowFavorites={() => setIsFavoritesPanelOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex justify-center border-b border-gray-200 dark:border-gray-800">
              <TabButton isActive={searchMode === 'near_me'} onClick={() => setSearchMode('near_me')}>
                  Find Near Me
              </TabButton>
              <TabButton isActive={searchMode === 'specific_location'} onClick={() => setSearchMode('specific_location')}>
                  Find Anywhere
              </TabButton>
          </div>
          
          {searchMode === 'near_me' && (
            (appState === 'idle' || appState === 'requesting_location' || appState === 'location_denied' || !location) ? (
                <div className="animate-fadeInUp"><LocationPermission onRequest={handleRequestLocation} error={error} /></div>
            ) : (
                <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">What are you looking for?</h2>
                    <SearchForm 
                        prompt={prompt}
                        setPrompt={setPrompt}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        onUseMyLocation={handleUseMyLocationSearch}
                        searchMode={searchMode}
                        locationQuery={locationQuery}
                        setLocationQuery={setLocationQuery}
                    />
                    <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
                </div>
            )
          )}
          
          {searchMode === 'specific_location' && (
             <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">What and where are you looking for?</h2>
                <SearchForm 
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onUseMyLocation={handleUseMyLocationSearch}
                    searchMode={searchMode}
                    locationQuery={locationQuery}
                    setLocationQuery={setLocationQuery}
                />
                <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
             </div>
          )}

          {(appState === 'results_found' || (appState === 'error' && result)) && (
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <ResultsDisplay 
                ref={resultsContainerRef}
                isLoading={isLoading}
                result={filteredResult}
                error={error}
                userLocation={location}
                theme={theme}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                highlightedPlace={highlightedPlace}
                onHighlightClear={() => setHighlightedPlace(null)}
                onPlaceSelected={handlePlaceSelected}
                reviewsForPlace={reviewsForPlace}
                onAddReview={addReview}
                activeFilters={activeFilters}
                onToggleFilter={handleToggleFilter}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <FavoritesPanel 
        isOpen={isFavoritesPanelOpen}
        onClose={() => setIsFavoritesPanelOpen(false)}
        favorites={favorites}
        recentlyViewed={recentlyViewed}
        onToggleFavorite={toggleFavorite}
        onSelectFavorite={handleSelectFavorite}
      />
    </div>
  );
};

export default App;