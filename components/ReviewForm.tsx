import React, { useState } from 'react';
import type { Review } from '../types';

interface ReviewFormProps {
  onSubmit: (review: Review) => void;
  onCancel: () => void;
}

const StarIcon = ({ filled, onClick, disabled }: { filled: boolean; onClick: () => void, disabled: boolean }) => (
    <button type="button" onClick={onClick} className="p-0.5" aria-label={`Rate ${filled ? 'filled' : 'empty'} star`} disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    </button>
);

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      setIsSubmitting(true);
      // Simulate an upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit({ rating, comment, photoFilename: selectedFile?.name });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Rating</label>
            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                    >
                        <StarIcon filled={(hoverRating || rating) >= star} onClick={() => setRating(star)} disabled={isSubmitting} />
                    </div>
                ))}
            </div>
        </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike?"
          className="mt-1 w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition sm:text-sm"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add Photo (optional)
        </label>
        <div className="mt-1 flex items-center gap-2">
            <label htmlFor="photo-upload" className={`relative cursor-pointer rounded-md font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md">Upload a file</span>
                <input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isSubmitting} />
            </label>
            {selectedFile && <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedFile.name}</span>}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors"
        >
          {isSubmitting && <ButtonSpinner />}
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};