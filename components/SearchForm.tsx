import React from 'react';

interface SearchFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onUseMyLocation: () => void;
  searchMode: 'near_me' | 'specific_location';
  locationQuery: string;
  setLocationQuery: (query: string) => void;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const CrosshairsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.485-7.485l-1.414 1.414M6.929 17.071l-1.414 1.414m11.57-1.414l-1.414-1.414M5.515 6.929L6.929 5.515" />
    </svg>
);

export const SearchForm: React.FC<SearchFormProps> = ({ prompt, setPrompt, onSubmit, isLoading, onUseMyLocation, searchMode, locationQuery, setLocationQuery }) => {
  return (
    <form onSubmit={onSubmit} className="w-full space-y-3">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., quiet cafes with a view, secluded parks for reading..."
          className="w-full p-4 pr-48 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
          rows={2}
          disabled={isLoading}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
            <button
                type="button"
                onClick={onUseMyLocation}
                disabled={isLoading}
                className="flex items-center justify-center h-10 w-10 text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                aria-label="Use my current location"
            >
                <CrosshairsIcon />
            </button>
            <button
              type="submit"
              disabled={isLoading || (searchMode === 'specific_location' && (!prompt.trim() || !locationQuery.trim()))}
              className="flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 dark:focus:ring-offset-black transition-colors"
            >
              {isLoading ? 'Searching...' : <><SearchIcon /> <span className="ml-2">Find</span></>}
            </button>
        </div>
      </div>
      {searchMode === 'specific_location' && (
        <div className="relative">
            <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Where? e.g., Paris, France"
                className="w-full p-4 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                disabled={isLoading}
                aria-label="Location to search in"
            />
        </div>
      )}
    </form>
  );
};