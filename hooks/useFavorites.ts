import { useState, useEffect, useCallback } from 'react';
import type { Place } from '../types';

const FAVORITES_KEY = 'hidden_gems_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    }
  }, []);

  const saveFavorites = (newFavorites: Place[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  };

  const toggleFavorite = useCallback((place: Place) => {
    const isFavorited = favorites.some(fav => fav.name === place.name && fav.lat === place.lat && fav.lng === place.lng);
    let newFavorites;
    if (isFavorited) {
      newFavorites = favorites.filter(fav => fav.name !== place.name || fav.lat !== place.lat || fav.lng !== place.lng);
    } else {
      newFavorites = [...favorites, place];
    }
    saveFavorites(newFavorites);
  }, [favorites]);

  return { favorites, toggleFavorite };
};
