import {useEffect, useMemo, useState} from 'react';
import {Progress, Select, TextInput, Button} from 'flowbite-react';
import {
  ClockIcon,
  ArrowUpIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type {UploadItemProps, UploadStatus} from '@/types/upload';
import type {Genre} from '@/api/types';

const PREDEFINED_GENRES: Genre[] = [
  'Nature',
  'Architecture',
  'Portrait',
  'Uncategorized',
];

const STATUS_COLORS: Record<UploadStatus, string> = {
  waiting: 'text-gray-500',
  uploading: 'text-blue-500',
  processing: 'text-yellow-500',
  done: 'text-green-500',
  error: 'text-red-500',
};

const PROGRESS_COLORS: Record<
  UploadStatus,
  'blue' | 'green' | 'red' | 'gray' | 'yellow'
> = {
  waiting: 'gray',
  uploading: 'blue',
  processing: 'yellow',
  done: 'green',
  error: 'red',
};

interface GenreSelectProps {
  value: Genre;
  customValue?: string;
  onChange: (genre: Genre) => void;
  onCustomChange: (customGenre: string) => void;
  disabled?: boolean;
}

function GenreSelect({
  value,
  customValue,
  onChange,
  onCustomChange,
  disabled,
}: GenreSelectProps) {
  const isPredefinedGenre = PREDEFINED_GENRES.includes(value);
  const showCustomInput = !isPredefinedGenre;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '__custom__') {
      // User selected "Custom..." - showCustomInput will become true
      // Call onChange with current value to trigger the custom input display
      onChange(value);
    } else {
      onChange(selectedValue as Genre);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={showCustomInput ? '__custom__' : value}
        onChange={handleChange}
        disabled={disabled}
        className="w-40"
      >
        {PREDEFINED_GENRES.map(genre => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
        {/* TODO Решил пока убрать эту фичу */}
        {/* <option value="__custom__">Custom...</option> */}
      </Select>

      {showCustomInput && (
        <TextInput
          type="text"
          placeholder="Enter custom genre"
          value={customValue ?? ''}
          onChange={e => onCustomChange(e.target.value)}
          disabled={disabled}
          className="w-40"
        />
      )}
    </div>
  );
}

interface StatusIconProps {
  status: UploadStatus;
}

function StatusIcon({status}: StatusIconProps) {
  const iconClass = 'h-5 w-5';

  switch (status) {
    case 'waiting':
      return <ClockIcon className={`${iconClass} ${STATUS_COLORS.waiting}`} />;
    case 'uploading':
      return (
        <ArrowUpIcon
          className={`${iconClass} ${STATUS_COLORS.uploading} animate-bounce`}
        />
      );
    case 'processing':
      return (
        <ArrowPathIcon
          className={`${iconClass} ${STATUS_COLORS.processing} animate-spin`}
        />
      );
    case 'done':
      return <CheckIcon className={`${iconClass} ${STATUS_COLORS.done}`} />;
    case 'error':
      return <XMarkIcon className={`${iconClass} ${STATUS_COLORS.error}`} />;
    default:
      return null;
  }
}

export function UploadItem({
  item,
  onGenreChange,
  onCustomGenreChange,
  onRetry,
  onRemove,
}: UploadItemProps) {
  // Create thumbnail URL and cleanup on unmount
  // Using useState + useEffect instead of useMemo to properly handle StrictMode remounts
  // useMemo caches the URL and doesn't recreate it on remount, but cleanup revokes it
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(item.file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThumbnailUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item.file]);

  const isGenreEditable = item.status === 'waiting' || item.status === 'error';

  const progressColor = useMemo(
    () => PROGRESS_COLORS[item.status],
    [item.status],
  );

  const truncatedFilename = useMemo(() => {
    const maxLength = 30;
    if (item.file.name.length > maxLength) {
      return item.file.name.substring(0, maxLength - 3) + '...';
    }
    return item.file.name;
  }, [item.file.name]);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0">
        {thumbnailUrl && item.file.type.startsWith('image/') ? (
          <img
            src={thumbnailUrl}
            alt={item.file.name}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
            <span className="text-xs text-gray-400">No preview</span>
          </div>
        )}
      </div>

      {/* Filename */}
      <div className="w-32 shrink-0 truncate" title={item.file.name}>
        <span className="text-sm font-medium text-gray-700">
          {truncatedFilename}
        </span>
      </div>

      {/* Genre Select */}
      <GenreSelect
        value={item.genre}
        customValue={item.customGenre}
        onChange={genre => onGenreChange(item.id, genre)}
        onCustomChange={customGenre =>
          onCustomGenreChange(item.id, customGenre)
        }
        disabled={!isGenreEditable}
      />

      {/* Progress Bar */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Progress
            progress={item.progress}
            color={progressColor}
            className="flex-1"
          />
          <span className="w-10 text-right text-sm text-gray-500">
            {item.progress}%
          </span>
        </div>
      </div>

      {/* Status Icon */}
      <div className="shrink-0">
        <StatusIcon status={item.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 gap-2">
        {item.status === 'error' && (
          <Button size="xs" onClick={() => onRetry(item.id)}>
            Retry
          </Button>
        )}
        {item.status === 'waiting' && (
          <Button
            size="xs"
            color="red"
            outline
            onClick={() => onRemove(item.id)}
          >
            Remove
          </Button>
        )}
      </div>

      {/* Error Message */}
      {item.status === 'error' && item.error && (
        <div className="absolute mt-24 ml-20">
          <span className="text-sm text-red-500">{item.error}</span>
        </div>
      )}
    </div>
  );
}
