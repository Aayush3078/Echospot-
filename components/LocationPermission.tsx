import React from 'react';

interface LocationPermissionProps {
  onRequest: () => void;
  error: string | null;
}

const CompassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
        <defs>
            <linearGradient id="compassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <g stroke="url(#compassGradient)">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.485-7.485l-1.414 1.414M6.929 17.071l-1.414 1.414m11.57-1.414l-1.414-1.414M5.515 6.929L6.929 5.515" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </g>
    </svg>
);


export const LocationPermission: React.FC<LocationPermissionProps> = ({ onRequest, error }) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <CompassIcon />
      <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Shhh... Let's Find Your Secret Spot
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Discover places that will make your friends ask, "How did you find this?!".
      </p>
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <button
        onClick={onRequest}
        className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-black transition-colors"
      >
        Find Near Me
      </button>
    </div>
  );
};