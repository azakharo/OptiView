import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {client} from '@/api/client';
import {uploadImage} from '@/api/images.api';
import type {ImageFilterDto, Image} from '@/api/types';

/**
 * Query keys for TanStack Query cache management.
 */
export const queryKeys = {
  images: (filters: ImageFilterDto) => ['images', filters] as const,
  image: (id: string) => ['image', id] as const,
  imageMetadata: (id: string) => ['imageMetadata', id] as const,
} as const;

/**
 * Hook for fetching paginated images with filters.
 * Uses openapi-fetch client for type-safe API calls.
 * Error handling is handled by client middleware.
 */
export function useImages(filters: ImageFilterDto = {}) {
  return useQuery({
    queryKey: queryKeys.images(filters),
    queryFn: async () =>
      (await client.GET('/api/images', {params: {query: filters}})).data!,
  });
}

/**
 * Hook for fetching single image metadata.
 * Error handling is handled by client middleware.
 */
export function useImageMetadata(id: string) {
  return useQuery({
    queryKey: queryKeys.imageMetadata(id),
    queryFn: async () =>
      (await client.GET('/api/images/{id}/metadata', {params: {path: {id}}}))
        .data!,
    enabled: !!id,
  });
}

/**
 * Hook for updating image rating with optimistic updates.
 * Uses openapi-fetch client for type-safe PATCH request.
 * Error handling is handled by client middleware.
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, rating}: {id: string; rating: number}) => {
      const {data} = await client.PATCH('/api/images/{id}/rating', {
        params: {path: {id}},
        body: {rating},
      });
      return data!;
    },

    // Optimistic update
    onMutate: async ({id, rating}) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({queryKey: queryKeys.imageMetadata(id)});

      // Snapshot previous value
      const previousImage = queryClient.getQueryData<Image>(
        queryKeys.imageMetadata(id),
      );

      // Optimistically update
      if (previousImage) {
        queryClient.setQueryData<Image>(queryKeys.imageMetadata(id), {
          ...previousImage,
          rating,
        });
      }

      return {previousImage};
    },

    // Revert on error
    onError: (err, {id}, context) => {
      if (context?.previousImage) {
        queryClient.setQueryData(
          queryKeys.imageMetadata(id),
          context.previousImage,
        );
      }
      console.error('Failed to update rating:', err);
    },

    // Refetch after settling
    onSettled: (_data, _error, {id}) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.imageMetadata(id),
      });
      void queryClient.invalidateQueries({queryKey: ['images']});
    },
  });
}

/**
 * Hook for uploading images with progress tracking.
 * Uses custom uploadImage function with axios-based progress.
 */
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      genre,
      onProgress,
    }: {
      file: File;
      genre: Parameters<typeof uploadImage>[1];
      onProgress?: (progress: number) => void;
    }) => uploadImage(file, genre, onProgress),

    onSuccess: () => {
      // Invalidate images list to show new upload
      void queryClient.invalidateQueries({queryKey: ['images']});
    },
  });
}
