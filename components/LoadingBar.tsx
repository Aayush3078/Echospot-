import React from 'react';

interface LoadingBarProps {
    isLoading: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ isLoading }) => {
    return (
        <div className={`fixed top-0 left-0 w-full h-1 z-50 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-full h-full overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-teal-500/30"></div>
                <div className="absolute top-0 left-0 w-1/2 h-full bg-teal-500 animate-loading-bar"></div>
            </div>
        </div>
    );
};
