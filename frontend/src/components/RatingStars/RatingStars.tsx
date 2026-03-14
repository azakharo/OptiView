import {useState} from 'react';

interface RatingStarsProps {
  rating: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
}

const StarIcon = ({
  filled,
  size,
}: {
  filled: boolean;
  size: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${
        filled
          ? 'fill-yellow-400 text-yellow-400'
          : 'fill-gray-300 text-gray-300'
      }`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

export function RatingStars({
  rating,
  readonly = false,
  size = 'md',
  onChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (readonly) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <StarIcon key={star} filled={star <= rating} size={size} />
        ))}
        <span className="ml-1 text-sm text-gray-500">({rating})</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="focus-visible:ring-primary-500 rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2"
          onClick={e => {
            e.stopPropagation();
            onChange?.(star);
          }}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(null)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <StarIcon filled={(hoverRating ?? rating) >= star} size={size} />
        </button>
      ))}
    </div>
  );
}
