import React, { useState } from 'react';
import type { Place } from '../types';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Place[];
  recentlyViewed: Place[];
  onToggleFavorite: (place: Place) => void;
  onSelectFavorite: (place: Place) => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EmptyStateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const FilledStarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const PlaceItem: React.FC<{ place: Place; onSelect: (place: Place) => void; children?: React.ReactNode; style?: React.CSSProperties }> = ({ place, onSelect, children, style }) => {
    const navigationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
    return (
        <li style={style} className="bg-gray-100 dark:bg-gray-800/50 rounded-lg flex items-start space-x-4 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-[1.02]">
            <div 
              className="flex-grow p-4 cursor-pointer"
              onClick={() => onSelect(place)}
            >
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{place.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{place.description}</p>
                <a 
                    href={navigationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-teal-600 hover:underline dark:text-teal-400 mt-2 inline-block relative z-10"
                >
                    View on Google Maps
                </a>
            </div>
            {children}
        </li>
    );
};


export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ isOpen, onClose, favorites, recentlyViewed, onToggleFavorite, onSelectFavorite }) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'recent'>('favorites');

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-panel-title"
      >
        <div className="h-full flex flex-col">
          <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <h2 id="favorites-panel-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">My Gems</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="Close panel"
            >
              <CloseIcon />
            </button>
          </header>
          
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 flex-shrink-0">
            <nav className="-mb-px flex space-x-6">
                <button
                    onClick={() => setActiveTab('favorites')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'favorites' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Favorites ({favorites.length})
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'recent' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Recently Viewed
                </button>
            </nav>
          </div>

          <div className="flex-grow p-4 overflow-y-auto">
            {activeTab === 'favorites' && (
              favorites.length > 0 ? (
                  <ul className="space-y-3">
                      {favorites.map((place, index) => (
                          <PlaceItem 
                              key={`${place.name}-${place.lat}`} 
                              place={place} 
                              onSelect={onSelectFavorite}
                              style={{ animation: `fadeInUp 0.5s ${index * 0.05}s ease-out forwards`, opacity: 0 }}
                          >
                            <button 
                                onClick={() => onToggleFavorite(place)}
                                className="text-yellow-500 hover:text-yellow-400 transition-colors p-4 flex-shrink-0"
                                aria-label={`Remove ${place.name} from favorites`}
                            >
                                <FilledStarIcon />
                            </button>
                          </PlaceItem>
                      ))}
                  </ul>
              ) : (
                  <div className="text-center h-full flex flex-col justify-center items-center animate-fadeInUp">
                      <EmptyStateIcon />
                      <p className="mt-4 text-gray-500 dark:text-gray-400">You haven't saved any gems yet.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Click the star on a place to add it here.</p>
                  </div>
              )
            )}
            {activeTab === 'recent' && (
                recentlyViewed.length > 0 ? (
                    <ul className="space-y-3">
                        {recentlyViewed.map((place, index) => (
                            <PlaceItem 
                                key={`${place.name}-${place.lat}-${place.description.length}`} 
                                place={place} 
                                onSelect={onSelectFavorite}
                                style={{ animation: `fadeInUp 0.5s ${index * 0.05}s ease-out forwards`, opacity: 0 }}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center h-full flex flex-col justify-center items-center animate-fadeInUp">
                        <EmptyStateIcon />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">No recently viewed places.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Click on a gem on the map to see it here.</p>
                    </div>
                )
            )}
          </div>
        </div>
      </div>
    </>
  );
};