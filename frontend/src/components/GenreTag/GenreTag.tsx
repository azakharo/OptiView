import {Badge} from 'flowbite-react';
import type {Genre} from '../../api/types';

interface GenreTagProps {
  genre: Genre;
  size?: 'sm' | 'md';
}

const GENRE_COLORS: Record<
  Genre,
  'info' | 'success' | 'warning' | 'failure' | 'purple' | 'pink' | 'gray'
> = {
  Nature: 'success',
  Architecture: 'info',
  Portrait: 'pink',
  Uncategorized: 'gray',
};

export function GenreTag({genre, size = 'sm'}: GenreTagProps) {
  return (
    <Badge color={GENRE_COLORS[genre]} size={size} data-testid="genre-tag">
      {genre}
    </Badge>
  );
}
