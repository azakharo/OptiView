import {useState, useCallback} from 'react';
import {useUploadImage} from './useImages';
import type {UploadItemState, UploadStatus} from '@/types/upload';
import type {Genre, Image} from '@/api/types';

const MAX_CONCURRENT_UPLOADS = 3;

export function useUploadQueue() {
  const [items, setItems] = useState<UploadItemState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadImage();

  const updateItemStatus = useCallback(
    (id: string, status: UploadStatus, error?: string) => {
      setItems(prev =>
        prev.map(item => (item.id === id ? {...item, status, error} : item)),
      );
    },
    [],
  );

  const updateItemProgress = useCallback((id: string, progress: number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, progress} : item)),
    );
  }, []);

  const updateItemResult = useCallback((id: string, result: Image) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, result} : item)),
    );
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const newItems: UploadItemState[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      genre: 'Uncategorized' as Genre,
      status: 'waiting',
      progress: 0,
    }));

    setItems(prev => [...prev, ...newItems]);
  }, []);

  const updateGenre = useCallback((id: string, genre: Genre) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, genre} : item)),
    );
  }, []);

  const updateCustomGenre = useCallback((id: string, customGenre: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, customGenre} : item)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const uploadItem = useCallback(
    async (item: UploadItemState) => {
      updateItemStatus(item.id, 'uploading');

      try {
        const result = await uploadMutation.mutateAsync({
          file: item.file,
          genre: item.genre,
          onProgress: progress => updateItemProgress(item.id, progress),
        });

        updateItemResult(item.id, result);
        updateItemStatus(item.id, 'done');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        updateItemStatus(item.id, 'error', errorMessage);
      }
    },
    [uploadMutation, updateItemStatus, updateItemProgress, updateItemResult],
  );

  const uploadAll = useCallback(async () => {
    const waitingItems = items.filter(item => item.status === 'waiting');

    if (waitingItems.length === 0) {
      return;
    }

    setIsUploading(true);

    // Process in batches of MAX_CONCURRENT_UPLOADS
    for (let i = 0; i < waitingItems.length; i += MAX_CONCURRENT_UPLOADS) {
      const batch = waitingItems.slice(i, i + MAX_CONCURRENT_UPLOADS);

      // Wait for all uploads in this batch to complete
      await Promise.all(batch.map(item => uploadItem(item)));
    }

    setIsUploading(false);
  }, [items, uploadItem]);

  const retryItem = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      if (item) {
        await uploadItem(item);
      }
    },
    [items, uploadItem],
  );

  return {
    items,
    isUploading,
    addFiles,
    updateGenre,
    updateCustomGenre,
    removeItem,
    uploadAll,
    retryItem,
  };
}
