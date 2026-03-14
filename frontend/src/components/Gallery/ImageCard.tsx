import {useState} from 'react';
import {RatingStars} from '../RatingStars/RatingStars';
import {GenreTag} from '../GenreTag/GenreTag';
import type {Image} from '../../api/types';

interface ImageCardProps {
  image: Image;
  onClick: () => void;
  onRatingChange?: (imageId: string, rating: number) => void;
}

export function ImageCard({image, onClick, onRatingChange}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const imageUrl = `/api/images/${image.id}?width=400`;

  return (
    <div
      className="group relative w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-lg"
      style={{
        aspectRatio: image.aspectRatio,
        backgroundColor: image.dominantColor || '#e5e7eb',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {image.lqipBase64 && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${image.lqipBase64})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      <img
        src={imageUrl}
        alt={image.filename}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <RatingStars
            rating={image.rating}
            size="sm"
            onChange={
              onRatingChange
                ? rating => onRatingChange(image.id, rating)
                : undefined
            }
          />
          <GenreTag genre={image.genre} size="sm" />
        </div>
      </div>
    </div>
  );
}
