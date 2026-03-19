import {useUrlState} from 'state-in-url/react-router';
import type {Genre, SortField, SortOrder} from '../api/types';

// Define filter state type - only non-default values appear in URL
type FilterState = {
  genre: Genre | undefined;
  rating: number | undefined;
  sort: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
};

// Default values - these won't appear in URL when set
const defaultFilters: FilterState = {
  genre: undefined,
  rating: undefined,
  sort: 'createdAt' as SortField,
  sortOrder: 'DESC' as SortOrder,
  page: 1,
  pageSize: 20,
};

// Hook returns individual filter values and setters
interface UseFiltersReturn {
  // Individual filter values
  genre: Genre | undefined;
  rating: number | undefined;
  sort: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
  // Individual setters for explicit API
  setGenre: (genre: Genre | undefined) => void;
  setRating: (rating: number | undefined) => void;
  setSort: (sort: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  // Reset function
  resetFilters: () => void;
}

export function useFilters(): UseFiltersReturn {
  const {urlState, setUrl} = useUrlState(defaultFilters, {
    replace: true, // Don't create history entries for filter changes
  });

  // Individual setters
  const setGenre = (genre: Genre | undefined) => setUrl({genre, page: 1});
  const setRating = (rating: number | undefined) => setUrl({rating, page: 1});
  const setSort = (sort: SortField) => setUrl({sort, page: 1});
  const setSortOrder = (sortOrder: SortOrder) => setUrl({sortOrder, page: 1});
  const setPage = (page: number) => setUrl({page});
  const setPageSize = (pageSize: number) => setUrl({pageSize, page: 1});

  return {
    // Values
    genre: urlState.genre,
    rating: urlState.rating,
    sort: urlState.sort,
    sortOrder: urlState.sortOrder,
    page: urlState.page,
    pageSize: urlState.pageSize,
    // Setters
    setGenre,
    setRating,
    setSort,
    setSortOrder,
    setPage,
    setPageSize,
    resetFilters: () => setUrl((_curr, initial) => initial),
  };
}
