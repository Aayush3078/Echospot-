import { useState, useEffect, useCallback } from 'react';
import type { Place } from '../types';

const RECENTLY_VIEWED_KEY = 'hidden_gems_recently_viewed';
const MAX_RECENT_ITEMS = 5;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Place[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse recently viewed from localStorage", error);
    }
  }, []);

  const saveRecentlyViewed = (newList: Place[]) => {
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newList));
      setRecentlyViewed(newList);
    } catch (error) {
      console.error("Failed to save recently viewed to localStorage", error);
    }
  };

  const addRecentlyViewed = useCallback((place: Place) => {
    const isAlreadyInList = recentlyViewed.some(p => p.name === place.name && p.lat === place.lat && p.lng === place.lng);
    
    let newList = recentlyViewed.filter(p => p.name !== place.name || p.lat !== place.lat || p.lng !== place.lng);
    
    newList.unshift(place);
    
    if (newList.length > MAX_RECENT_ITEMS) {
      newList = newList.slice(0, MAX_RECENT_ITEMS);
    }
    
    saveRecentlyViewed(newList);
  }, [recentlyViewed]);

  return { recentlyViewed, addRecentlyViewed };
};