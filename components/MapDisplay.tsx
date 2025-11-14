import React, { useState, useEffect, useMemo } from 'react';
import { Map, ZoomControl, Overlay } from 'pigeon-maps';
import type { Place, PlaceCategory, Review, Location } from '../types';
import { ReviewForm } from './ReviewForm';

// --- Custom Map Providers (Switched to CartoDB for performance) ---
const cartoLight = (x: number, y: number, z: number, dpr?: number) => {
  return `https://a.basemaps.cartocdn.com/light_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`
}
const cartoDark = (x: number, y: number, z: number, dpr?: number) => {
  return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`
}

const mapProviders = {
  light: cartoLight,
  dark: cartoDark
};

interface MapDisplayProps {
  center: [number, number];
  places: Place[];
  theme: 'light' | 'dark';
  favorites: Place[];
  onToggleFavorite: (place: Place) => void;
  highlightedPlace: Place | null;
  onHighlightClear: () => void;
  onPlaceSelected: (place: Place) => void;
  reviewsForPlace: (placeId: string) => Review[];
  onAddReview: (placeId: string, review: Review) => void;
  userLocation: Location | null;
}

const getPlaceId = (place: Place) => `${place.lat}_${place.lng}`;

// --- Icon Components ---
const FilledStarIcon = ({ className = "h-5 w-5 text-yellow-400" }) => (
    <svg xmlns="http://www.w.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const OutlineStarIcon = ({ className = "h-5 w-5 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const CategoryIcon: React.FC<{ category: PlaceCategory; className?: string }> = ({ category, className = "h-5 w-5" }) => {
    const icons: Record<PlaceCategory, React.ReactNode> = {
        food: <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m-8 4h8m-8-8v8l-4-4 4-4zM6 5v16" />,
        view: <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
        tranquility: <path d="M3.5 4a.5.5 0 01.5.5v15a.5.5 0 01-1 0V4.5a.5.5 0 01.5-.5zM15.5 4a.5.5 0 01.5.5v15a.5.5 0 01-1 0V4.5a.5.5 0 01.5-.5zM7.5 4a.5.5 0 01.5.5v15a.5.5 0 01-1 0V4.5a.5.5 0 01.5-.5zM11.5 4a.5.5 0 01.5.5v15a.5.5 0 01-1 0V4.5a.5.5 0 01.5-.5z" />,
        park: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.884 11l3.232-5.656a2 2 0 013.76 0L18.116 11M14.12 21h-4.24" />,
        cafe: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
        scenic: <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
        other: <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    };

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icons[category]}
        </svg>
    );
};

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PaperClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

// --- Place Components ---
const PlaceMarker: React.FC<{ place: Place; onClick: () => void; isActive: boolean; index: number }> = ({ place, onClick, isActive, index }) => {
    return (
        <button
            onClick={onClick}
            // The initial pop-in is handled by animate-markerPopIn
            className={`transform transition-all duration-300 ease-out animate-markerPopIn ${isActive ? 'scale-135 z-10' : 'scale-100'}`}
            style={{ animationDelay: `${index * 30}ms`, opacity: 0 }}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-teal-500 shadow-2xl' : 'bg-white dark:bg-gray-800 shadow-lg'}`}>
                <CategoryIcon category={place.category} className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`} />
            </div>
            {/* Make the fake shadow larger and more blurred when active for a 'lifted' effect */}
            <div className={`mx-auto mt-1 bg-black/40 dark:bg-black/70 rounded-full transition-all duration-300 ${isActive ? 'w-4 h-1 blur-md' : 'w-2 h-2 blur-sm'}`}></div>
        </button>
    );
};

const UserLocationMarker: React.FC = () => (
    <div className="w-5 h-5 relative z-20">
        <div className="w-full h-full rounded-full bg-blue-500 border-2 border-white shadow-md animate-pulse"></div>
    </div>
);


const PlacePopup: React.FC<Omit<MapDisplayProps, 'center' | 'places' | 'highlightedPlace' | 'onHighlightClear' | 'theme'> & { place: Place; onClose: () => void }> = ({
    place,
    onClose,
    favorites,
    onToggleFavorite,
    reviewsForPlace,
    onAddReview,
}) => {
    const isFavorited = useMemo(() => favorites.some(fav => fav.name === place.name && fav.lat === place.lat), [favorites, place]);
    const placeId = getPlaceId(place);
    const reviews = reviewsForPlace(placeId);
    const [activeTab, setActiveTab] = useState('details');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [shareMessage, setShareMessage] = useState('');

    const handleShare = async () => {
        const shareData = {
            title: `Hidden Gem: ${place.name}`,
            text: `Check out this hidden gem I found: ${place.name}. ${place.description}`,
            url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)},${place.lat},${place.lng}`,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                setShareMessage('Link copied!');
                setTimeout(() => setShareMessage(''), 2000);
            }
        } catch (err) {
            console.error('Share failed:', err);
            await navigator.clipboard.writeText(shareData.url);
            setShareMessage('Link copied!');
            setTimeout(() => setShareMessage(''), 2000);
        }
    };
    
    const TabButton = ({ tabName, label }: { tabName: string; label: string }) => (
        <button
          onClick={() => { setActiveTab(tabName); setShowReviewForm(false); }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === tabName
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {label}
        </button>
      );

    return (
        <div className="w-80 max-h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-gray-950 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <header className="p-3 flex justify-between items-start gap-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{place.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                        <FilledStarIcon className="h-4 w-4" />
                        <span className="font-semibold">{place.estimatedRating.toFixed(1)}</span>
                        <span className="text-gray-500 dark:text-gray-400">(Est. Rating)</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><CloseIcon /></button>
            </header>
            
            <nav className="p-2 flex justify-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <TabButton tabName="details" label="Details" />
                <TabButton tabName="reviews" label={`Reviews (${reviews.length})`} />
                <TabButton tabName="directions" label="Directions" />
            </nav>

            <div className="p-3 overflow-y-auto">
                {activeTab === 'details' && (
                    <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{place.description}</p>
                        <div className="flex gap-2">
                            <button onClick={() => onToggleFavorite(place)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors" aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
                                {isFavorited ? <FilledStarIcon /> : <OutlineStarIcon />}
                                {isFavorited ? 'Favorited' : 'Favorite'}
                            </button>
                            <button 
                                onClick={handleShare} 
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    shareMessage 
                                    ? 'bg-green-500 text-white dark:bg-green-600' 
                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`} 
                                aria-label="Share place"
                            >
                                {shareMessage ? <CheckIcon /> : <ShareIcon />} {shareMessage || 'Share'}
                            </button>
                        </div>
                    </>
                )}
                {activeTab === 'reviews' && (
                     <div className="">
                        {showReviewForm ? (
                            <ReviewForm
                                onSubmit={(review) => { onAddReview(placeId, review); setShowReviewForm(false); }}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        ) : (
                            <>
                                {reviews.length > 0 ? (
                                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                        {reviews.map((review, index) => (
                                            <li key={index} className="text-sm">
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <FilledStarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                                                {review.photoFilename && <div className="flex items-center mt-1 text-xs text-gray-500"><PaperClipIcon />{review.photoFilename}</div>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Be the first to leave a review!</p>
                                )}
                                <button onClick={() => setShowReviewForm(true)} className="w-full mt-3 px-3 py-1.5 text-sm font-medium bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md transition-colors">
                                    Add a Review
                                </button>
                            </>
                        )}
                    </div>
                )}
                 {activeTab === 'directions' && (
                    <div className="text-center">
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)},${place.lat},${place.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-black transition-colors"
                        >
                            Open in Google Maps
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};


export const MapDisplay: React.FC<MapDisplayProps> = ({
  center,
  places,
  theme,
  favorites,
  onToggleFavorite,
  highlightedPlace,
  onHighlightClear,
  onPlaceSelected,
  reviewsForPlace,
  onAddReview,
  userLocation,
}) => {
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [mapProps, setMapProps] = useState({
      center: center,
      zoom: 12
  });

  // Auto-fit map to show all places when results change
  useEffect(() => {
    if (highlightedPlace || activePlace) return; // Don't auto-fit if a place is selected

    if (!places || places.length === 0) {
        setMapProps({ center: center, zoom: 12 });
        return;
    }

    if (places.length === 1) {
        setMapProps({ center: [places[0].lat, places[0].lng], zoom: 14 });
        return;
    }

    const lats = places.map(p => p.lat);
    const lngs = places.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const newCenter: [number, number] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 12;
    if (maxDiff < 0.02) zoom = 15;
    else if (maxDiff < 0.05) zoom = 14;
    else if (maxDiff < 0.1) zoom = 13;
    else if (maxDiff < 0.2) zoom = 12;
    else if (maxDiff < 0.5) zoom = 11;
