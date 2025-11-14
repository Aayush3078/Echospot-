import React from 'react';

const EchoSpotLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fillRule="evenodd" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" clipRule="evenodd" className="fill-gray-800 dark:fill-gray-200" transform="scale(0.7) translate(5, 6)"/>
        <path d="M 12,12 m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" />
        <path d="M 12,12 m -6,0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M 12,12 m -9,0 a 9,9 0 1,0 18,0 a 9,9 0 1,0 -18,0" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" strokeOpacity="0.3" />
    </svg>
);


const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


interface HeaderProps {
    favoritesCount: number;
    onShowFavorites: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ favoritesCount, onShowFavorites, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 w-full p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <EchoSpotLogo />
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            EchoSpot
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onShowFavorites}
            className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Show my favorite gems"
          >
            <StarIcon />
            <span className="hidden sm:block">My Gems</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center h-10 w-10 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};