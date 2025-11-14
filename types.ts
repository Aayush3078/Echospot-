export interface Location {
  latitude: number;
  longitude: number;
}

export interface Source {
  uri: string;
  title: string;
  type: 'maps' | 'web';
}

export type PlaceCategory = 'food' | 'view' | 'tranquility' | 'park' | 'cafe' | 'scenic' | 'other';

export const PLACE_CATEGORIES: PlaceCategory[] = ['food', 'view', 'tranquility', 'park', 'cafe', 'scenic', 'other'];

export interface Place {
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  estimatedRating: number;
}

export interface Review {
  rating: number; // 1 to 5
  comment: string;
  photoFilename?: string;
}


export type AppState =
  | 'idle'
  | 'requesting_location'
  | 'location_granted'
  | 'location_denied'
  | 'loading'
  | 'results_found'
  | 'error';