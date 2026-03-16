import {useCallback} from 'react';
import {useDropzone, type FileRejection} from 'react-dropzone';
import {Alert} from 'flowbite-react';
import type {DropZoneProps} from '@/types/upload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DropZone({onFilesSelected, disabled = false}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled,
  });

  const getRootClasses = () => {
    const baseClasses =
      'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer';

    if (disabled) {
      return `${baseClasses} border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed`;
    }

    const defaultClasses = 'border-gray-300 bg-gray-50 hover:border-gray-400';

    if (isDragReject) {
      return `${baseClasses} border-solid border-red-500 bg-red-50`;
    }

    if (isDragAccept) {
      return `${baseClasses} border-solid border-green-500 bg-green-50`;
    }

    if (isDragActive) {
      return `${baseClasses} border-solid border-blue-500 bg-blue-50`;
    }

    return `${baseClasses} ${defaultClasses}`;
  };

  const getContent = () => {
    if (isDragReject) {
      return (
        <>
          <p className="font-medium text-red-600">
            Some files will be rejected
          </p>
          <p className="mt-1 text-sm text-red-400">
            Please check file types and size
          </p>
        </>
      );
    }

    if (isDragActive) {
      return (
        <>
          <p className="font-medium text-blue-600">Drop files here...</p>
          <p className="mt-1 text-sm text-blue-400">Release to upload</p>
        </>
      );
    }

    return (
      <>
        <p className="font-medium text-gray-700">
          Drag and drop images here, or click to select
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Supports: JPEG, PNG, WebP • Max size: 10MB
        </p>
      </>
    );
  };

  return (
    <div>
      <div {...getRootProps({className: getRootClasses()})}>
        <input {...getInputProps()} />
        {getContent()}
      </div>
      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map((rejection: FileRejection) =>
            rejection.errors.map((error, index) => (
              // eslint-disable-next-line react-x/no-array-index-key
              <Alert key={`${rejection.file.name}-${index}`} color="failure">
                <span className="font-medium">{rejection.file.name}</span>:{' '}
                {error.message}
              </Alert>
            )),
          )}
        </div>
      )}
    </div>
  );
}
