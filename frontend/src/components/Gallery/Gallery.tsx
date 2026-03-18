import Masonry from 'react-responsive-masonry';
import {Pagination} from 'flowbite-react';
import {useFilters} from '../../hooks/useFilters';
import {useImages} from '../../hooks/useImages';
import {ImageCard} from './ImageCard';
import {LoadingSkeletonCards} from './LoadingSkeleton';
import type {Image} from '../../api/types';

interface GalleryProps {
  onImageClick: (image: Image) => void;
  onRatingChange?: (imageId: string, rating: number) => void;
}

export function Gallery({onImageClick, onRatingChange}: GalleryProps) {
  const {genre, rating, sort, sortOrder, page, pageSize, setPage} =
    useFilters();

  const {data, isLoading, isError, error} = useImages({
    genre,
    rating,
    sort,
    sortOrder,
    page,
    pageSize,
  });

  if (isLoading) {
    return <LoadingSkeletonCards />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-red-500">
        <p className="text-lg font-medium">Error loading images</p>
        <p className="text-sm text-gray-500">
          {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  if (!items?.length) {
    return (
      <div
        data-testid="empty-gallery-state"
        className="flex min-h-[400px] flex-col items-center justify-center text-gray-500"
      >
        <p className="text-lg font-medium">No images found</p>
        <p className="text-sm">
          Try adjusting your filters or upload some images
        </p>
      </div>
    );
  }

  return (
    <div data-testid="gallery-grid" className="mt-4">
      <Masonry
        columnsCountBreakPoints={{
          639: 2,
          1023: 3,
        }}
        columnsCount={4}
        gutter="16px"
      >
        {items.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => onImageClick(image)}
            onRatingChange={onRatingChange}
          />
        ))}
      </Masonry>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={newPage => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
}
