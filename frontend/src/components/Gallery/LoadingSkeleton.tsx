import {Spinner} from 'flowbite-react';

export function LoadingSkeleton() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

export function LoadingSkeletonCards() {
  const aspectRatios = [4 / 3, 3 / 4, 16 / 9, 1 / 1, 3 / 2, 2 / 3];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => (
        <div
          // eslint-disable-next-line react-x/no-array-index-key
          key={i}
          className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          style={{aspectRatio: aspectRatios[i % aspectRatios.length]}}
        />
      ))}
    </div>
  );
}
