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
        filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
      }`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 22 20"
    >
      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.231-1.007 1.523 1.523 0 0 0-1.116.343L15.29 10.77 12.064 1.457a1.523 1.523 0 0 0-2.613.048L7.814 10.77 4.061 7.374a1.523 1.523 0 0 0-1.116-.343 1.523 1.523 0 0 0-1.231 1.007L0.037 17.075a1.523 1.523 0 0 0 .599 1.674 1.523 1.523 0 0 0 1.674.599L7.814 18.58 11.04 20.434a1.523 1.523 0 0 0 1.231-.007 1.523 1.523 0 0 0 1.674-.599L14.186 18.58l5.163-3.396a1.523 1.523 0 0 0 .599-1.674l-1.637-7.075Z" />
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
          className="focus:ring-primary-500 rounded p-0.5 transition-transform hover:scale-110 focus:ring-2 focus:outline-none"
          onClick={() => onChange?.(star)}
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
