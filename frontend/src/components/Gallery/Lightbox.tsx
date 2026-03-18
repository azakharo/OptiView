import {useEffect, useCallback} from 'react';
import {createPortal} from 'react-dom';
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/24/outline';
import {RatingStars} from '../RatingStars/RatingStars';
import {GenreTag} from '../GenreTag/GenreTag';
import type {Image} from '../../api/types';

// Calculate optimal display width based on viewport and device pixel ratio
// Capped at 1920 to avoid unnecessarily large images on high-res displays
const getOptimalWidth = () => {
  const viewportWidth = window.innerWidth * window.devicePixelRatio;
  return Math.min(Math.round(viewportWidth), 1920);
};

const XIcon = ({className}: {className?: string}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface LightboxProps {
  image: Image | null;
  images: Image[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRatingChange?: (imageId: string, rating: number) => void;
}

export function Lightbox({
  image,
  images,
  isOpen,
  onClose,
  onNavigate,
  onRatingChange,
}: LightboxProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [isOpen, onNavigate, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!image || !isOpen) return null;

  // Find current index for navigation
  const currentIndex = images.findIndex(img => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const optimalWidth = getOptimalWidth();

  const lightboxContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Close Button - Top Right */}
      <button
        autoFocus
        type="button"
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white transition hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 focus:outline-none"
        onClick={onClose}
        aria-label="Close"
      >
        <XIcon className="h-5 w-5" />
      </button>

      {/* Navigation - Previous */}
      <button
        type="button"
        className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-500 text-white transition hover:bg-gray-600 disabled:opacity-30"
        onClick={() => onNavigate('prev')}
        disabled={!hasPrev}
        aria-label="Previous image"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Main Image */}
      <img
        src={`/api/images/${image.id}?width=${optimalWidth}`}
        alt={image.filename}
        className="h-full max-h-screen w-full max-w-[100vw] object-contain"
      />

      {/* Navigation - Next */}
      <button
        type="button"
        className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-500 text-white transition hover:bg-gray-600 disabled:opacity-30"
        onClick={() => onNavigate('next')}
        disabled={!hasNext}
        aria-label="Next image"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      {/* Footer: Rating, Genre, Downloads */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 rounded-xl bg-black/60 p-4">
        <div className="flex items-center gap-4">
          <RatingStars
            rating={image.rating}
            size="md"
            onChange={
              onRatingChange
                ? rating => onRatingChange(image.id, rating)
                : undefined
            }
          />
          <GenreTag genre={image.genre} size="md" />
        </div>

        <div className="flex gap-2">
          <a
            href={`/api/images/${image.id}?width=${optimalWidth}`}
            download={image.filename}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
          >
            Download {optimalWidth}px
          </a>
          <a
            href={`/api/images/${image.id}?width=1280`}
            download={image.filename}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
          >
            Download 1280px
          </a>
          <a
            href={`/api/images/${image.id}?width=640`}
            download={image.filename}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
          >
            Download 640px
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
