import {useEffect, useCallback} from 'react';
import {Modal} from 'flowbite-react';
import {RatingStars} from '../RatingStars/RatingStars';
import {GenreTag} from '../GenreTag/GenreTag';
import type {Image} from '../../api/types';

interface LightboxProps {
  image: Image | null;
  images: Image[];
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function Lightbox({
  image,
  images,
  isOpen,
  onClose,
  onNavigate,
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

  if (!image) return null;

  // Find current index for navigation
  const currentIndex = images.findIndex(img => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <Modal show={isOpen} onClose={onClose} size="7xl" dismissible>
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-black p-4">
        {/* Navigation - Previous */}
        <button
          type="button"
          className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-lg bg-white/80 p-3 text-2xl text-gray-800 transition hover:bg-white disabled:opacity-30"
          onClick={() => onNavigate('prev')}
          disabled={!hasPrev}
          aria-label="Previous image"
        >
          ←
        </button>

        {/* Main Image */}
        <img
          src={`/api/images/${image.id}?width=1920`}
          alt={image.filename}
          className="max-h-[70vh] w-auto object-contain"
        />

        {/* Navigation - Next */}
        <button
          type="button"
          className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-lg bg-white/80 p-3 text-2xl text-gray-800 transition hover:bg-white disabled:opacity-30"
          onClick={() => onNavigate('next')}
          disabled={!hasNext}
          aria-label="Next image"
        >
          →
        </button>

        {/* Footer: Rating, Genre, Downloads */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <RatingStars rating={image.rating} readonly size="md" />
            <GenreTag genre={image.genre} size="md" />
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/images/${image.id}?width=1920`}
              download={image.filename}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none"
            >
              Download 1920px
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
    </Modal>
  );
}
