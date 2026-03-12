import {useState, useCallback} from 'react';
import {Header} from '../components/Header/Header';
import {Gallery} from '../components/Gallery/Gallery';
import {Lightbox} from '../components/Gallery/Lightbox';
import {FAB} from '../components/FAB/FAB';
import {useImages} from '../hooks/useImages';
import {useFilters} from '../hooks/useFilters';
import type {Image} from '../api/types';

export function GalleryPage() {
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);
  const {genre, rating, sort, sortOrder, page, pageSize} = useFilters();
  const {data} = useImages({genre, rating, sort, sortOrder, page, pageSize});

  // Handle both possible response structures (schema bug: data is unknown[][] in generated types)
  const images = (data as unknown as {data?: Image[]})?.data ?? [];

  const handleImageClick = useCallback((image: Image) => {
    setLightboxImage(image);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxImage(null);
  }, []);

  const handleNavigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (!lightboxImage || !images.length) return;

      const currentIndex = images.findIndex(img => img.id === lightboxImage.id);
      if (currentIndex === -1) return;

      if (direction === 'prev' && currentIndex > 0) {
        setLightboxImage(images[currentIndex - 1]);
      } else if (direction === 'next' && currentIndex < images.length - 1) {
        setLightboxImage(images[currentIndex + 1]);
      }
    },
    [lightboxImage, images],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Main content with padding for fixed header */}
      <main className="container mx-auto px-4 py-6 pt-20">
        <Gallery onImageClick={handleImageClick} />
      </main>

      <FAB />

      <Lightbox
        image={lightboxImage}
        images={images}
        isOpen={!!lightboxImage}
        onClose={handleCloseLightbox}
        onNavigate={handleNavigateLightbox}
      />
    </div>
  );
}
