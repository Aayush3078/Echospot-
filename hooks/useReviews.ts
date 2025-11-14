import { useState, useEffect, useCallback } from 'react';
import type { Review } from '../types';

const REVIEWS_KEY = 'hidden_gems_reviews';

type ReviewsStore = {
  [placeId: string]: Review[];
};

export const useReviews = () => {
  const [reviews, setReviews] = useState<ReviewsStore>({});

  useEffect(() => {
    try {
      const storedReviews = localStorage.getItem(REVIEWS_KEY);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
    } catch (error) {
      console.error("Failed to parse reviews from localStorage", error);
    }
  }, []);

  const saveReviews = (newReviews: ReviewsStore) => {
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(newReviews));
      setReviews(newReviews);
    } catch (error) {
      console.error("Failed to save reviews to localStorage", error);
    }
  };

  const addReview = useCallback((placeId: string, review: Review) => {
    const newReviews = { ...reviews };
    const placeReviews = newReviews[placeId] || [];
    newReviews[placeId] = [...placeReviews, review];
    saveReviews(newReviews);
  }, [reviews]);

  const reviewsForPlace = useCallback((placeId: string): Review[] => {
    return reviews[placeId] || [];
  }, [reviews]);

  return { reviewsForPlace, addReview };
};
