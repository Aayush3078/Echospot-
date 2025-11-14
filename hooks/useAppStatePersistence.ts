import { useState, useEffect, useCallback } from 'react';
import type { AppState, Place, Source, PlaceCategory } from '../types';

const APP_STATE_KEY = 'echospot_app_state';

interface SavedState {
  appState: AppState;
  prompt: string;
  searchMode: 'near_me' | 'specific_location';
  locationQuery: string;
  result: { text: string; sources: Source[]; places: Place[] } | null;
  activeFilters: PlaceCategory[];
  timestamp: number;
}

const FIVE_MINUTES = 5 * 60 * 1000;

export const useAppStatePersistence = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [prompt, setPrompt] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'near_me' | 'specific_location'>('near_me');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [result, setResult] = useState<{ text: string; sources: Source[]; places: Place[] } | null>(null);
  const [activeFilters, setActiveFilters] = useState<PlaceCategory[]>([]);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(APP_STATE_KEY);
      if (storedState) {
        const saved: SavedState = JSON.parse(storedState);
        const now = new Date().getTime();
        // Restore only if the saved state is recent (e.g., less than 5 minutes old)
        if (now - saved.timestamp < FIVE_MINUTES) {
          setAppState(saved.appState);
          setPrompt(saved.prompt);
          setSearchMode(saved.searchMode);
          setLocationQuery(saved.locationQuery);
          setResult(saved.result);
          setActiveFilters(saved.activeFilters);
        } else {
            // Clear expired state
            localStorage.removeItem(APP_STATE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to parse saved state from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save state if there are results or it's an error state with previous results
    if (appState === 'results_found' || (appState === 'error' && result)) {
      try {
        const stateToSave: SavedState = {
          appState,
          prompt,
          searchMode,
          locationQuery,
          result,
          activeFilters,
          timestamp: new Date().getTime(),
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [appState, prompt, searchMode, locationQuery, result, activeFilters]);

  const clearSavedState = useCallback(() => {
    localStorage.removeItem(APP_STATE_KEY);
  }, []);

  return {
    appState, setAppState,
    prompt, setPrompt,
    searchMode, setSearchMode,
    locationQuery, setLocationQuery,
    result, setResult,
    activeFilters, setActiveFilters,
    clearSavedState,
  };
};
