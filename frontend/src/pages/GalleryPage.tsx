import {useState, useCallback, useMemo} from 'react';
import {Header} from '../components/Header/Header';
import {Gallery} from '../components/Gallery/Gallery';
import {Lightbox} from '../components/Gallery/Lightbox';
import {FAB} from '../components/FAB/FAB';
import {useImages, useUpdateRating} from '../hooks/useImages';
import {useFilters} from '../hooks/useFilters';
import type {Image} from '../api/types';

export function GalleryPage() {
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);
  const {genre, rating, sort, sortOrder, page, pageSize} = useFilters();
  const {data} = useImages({genre, rating, sort, sortOrder, page, pageSize});
  const updateRating = useUpdateRating();

  const images = useMemo(() => data?.data ?? [], [data]);

  // Derive lightboxImage from cache - this ensures it stays in sync with query cache
  const lightboxImage = useMemo(
    () =>
      lightboxImageId
        ? (images.find(img => img.id === lightboxImageId) ?? null)
        : null,
    [lightboxImageId, images],
  );

  const handleImageClick = useCallback((image: Image) => {
    setLightboxImageId(image.id);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImageId(null);
  }, []);

  const handleNavigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (!lightboxImageId || !images.length) return;

      const currentIndex = images.findIndex(img => img.id === lightboxImageId);
      if (currentIndex === -1) return;

      if (direction === 'prev' && currentIndex > 0) {
        setLightboxImageId(images[currentIndex - 1].id);
      } else if (direction === 'next' && currentIndex < images.length - 1) {
        setLightboxImageId(images[currentIndex + 1].id);
      }
    },
    [lightboxImageId, images],
  );

  const handleRatingChange = useCallback(
    (imageId: string, newRating: number) => {
      updateRating.mutate({id: imageId, rating: newRating});
    },
    [updateRating],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main content with padding for fixed header */}
      <main className="container mx-auto px-4 py-6 pt-20">
        <Gallery
          onImageClick={handleImageClick}
          onRatingChange={handleRatingChange}
        />
      </main>

      <FAB />

      <Lightbox
        image={lightboxImage}
        images={images}
        isOpen={!!lightboxImageId}
        onClose={handleCloseLightbox}
        onNavigate={handleNavigateLightbox}
        onRatingChange={handleRatingChange}
      />
    </div>
  );
}
