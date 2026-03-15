import {UploadItem} from './UploadItem';
import type {UploadQueueProps} from '@/types/upload';

export function UploadQueue({
  items,
  onGenreChange,
  onCustomGenreChange,
  onRetry,
  onRemove,
}: UploadQueueProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No files in queue. Drop files above to start uploading.
      </div>
    );
  }

  const completedCount = items.filter(item => item.status === 'done').length;

  return (
    <div className="space-y-4">
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {items.map(item => (
          <UploadItem
            key={item.id}
            item={item}
            onGenreChange={onGenreChange}
            onCustomGenreChange={onCustomGenreChange}
            onRetry={onRetry}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="text-sm text-gray-600">
        {completedCount} of {items.length} uploads complete
      </div>
    </div>
  );
}
