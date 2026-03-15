import {Link} from 'react-router-dom';
import {Button} from 'flowbite-react';
import {ArrowLeftIcon} from '@heroicons/react/24/outline';
import {DropZone} from '@/components/Upload/DropZone';
import {UploadQueue} from '@/components/Upload/UploadQueue';
import {useUploadQueue} from '@/hooks/useUploadQueue';

export function UploadPage() {
  const {
    items,
    isUploading,
    addFiles,
    updateGenre,
    updateCustomGenre,
    removeItem,
    uploadAll,
    retryItem,
  } = useUploadQueue();

  const hasWaitingItems = items.some(item => item.status === 'waiting');
  const allDone =
    items.length > 0 && items.every(item => item.status === 'done');

  const handleUploadMore = () => {
    // Clear all items and reload the page to start fresh
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeftIcon className="mr-2 h-5 w-5" />
        <span>Back to Gallery</span>
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Upload Images</h1>

      {/* DropZone */}
      <div className="mb-6">
        <DropZone onFilesSelected={addFiles} disabled={isUploading} />
      </div>

      {/* Upload Queue */}
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Upload Queue</h2>
        <UploadQueue
          items={items}
          onGenreChange={updateGenre}
          onCustomGenreChange={updateCustomGenre}
          onRetry={id => {
            void retryItem(id);
          }}
          onRemove={removeItem}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!allDone && (
          <Button
            onClick={() => {
              void uploadAll();
            }}
            disabled={!hasWaitingItems || isUploading}
            color="primary"
          >
            {isUploading ? 'Uploading...' : 'Upload All'}
          </Button>
        )}
        {allDone && (
          <>
            <Button color="success" onClick={handleUploadMore}>
              Upload More
            </Button>
            <Link to="/">
              <Button>Go to Gallery</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
