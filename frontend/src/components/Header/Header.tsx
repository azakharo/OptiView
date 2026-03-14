import {Select, Button} from 'flowbite-react';
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from 'flowbite-react/components/Navbar';
import {Dropdown, DropdownItem} from 'flowbite-react/components/Dropdown';
import {useFilters} from '../../hooks/useFilters';
import type {Genre} from '../../api/types';

const GENRE_OPTIONS: Genre[] = [
  'Nature',
  'Architecture',
  'Portrait',
  'Uncategorized',
];

// Sort field values as string literals (types don't have runtime values)
const SORT_CREATED_AT = 'createdAt' as const;
const SORT_RATING = 'rating' as const;
const SORT_FILENAME = 'filename' as const;
const ORDER_ASC = 'ASC' as const;
const ORDER_DESC = 'DESC' as const;

// Sort options configuration - single source of truth for labels
const SORT_OPTIONS = [
  {sort: SORT_CREATED_AT, sortOrder: ORDER_DESC, label: 'Newest First'},
  {sort: SORT_CREATED_AT, sortOrder: ORDER_ASC, label: 'Oldest First'},
  {sort: SORT_RATING, sortOrder: ORDER_DESC, label: 'Highest Rated'},
  {sort: SORT_RATING, sortOrder: ORDER_ASC, label: 'Lowest Rated'},
  {sort: SORT_FILENAME, sortOrder: ORDER_ASC, label: 'Name (A-Z)'},
  {sort: SORT_FILENAME, sortOrder: ORDER_DESC, label: 'Name (Z-A)'},
] as const;

// Map (sort, sortOrder) pairs to user-friendly display labels
function getSortLabel(
  sort: string | undefined,
  sortOrder: string | undefined,
): string {
  const option = SORT_OPTIONS.find(
    o => o.sort === sort && o.sortOrder === sortOrder,
  );
  if (option) return option.label;
  return `${sort ?? ''} ${sortOrder ?? ''}`.trim() || 'Sort';
}

export function Header() {
  const {
    genre,
    rating,
    sort,
    sortOrder,
    setGenre,
    setRating,
    setSort,
    setSortOrder,
    resetFilters,
  } = useFilters();

  return (
    <Navbar
      fluid
      className="fixed top-0 z-50 w-full bg-white shadow-sm dark:bg-gray-800"
    >
      <NavbarBrand href="/">
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          OptiView
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <div className="flex flex-wrap items-center gap-4 py-2">
          {/* Genre Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="genre-filter"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Genre:
            </label>
            <Select
              id="genre-filter"
              value={genre ?? ''}
              onChange={e => setGenre((e.target.value as Genre) || undefined)}
              className="w-auto"
            >
              <option value="">All Genres</option>
              {GENRE_OPTIONS.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="rating-filter"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Rating:
            </label>
            <Select
              id="rating-filter"
              value={rating ?? ''}
              onChange={e =>
                setRating(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-auto min-w-[130px]"
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </Select>
          </div>

          {/* Sort Dropdown */}
          <Dropdown label={`Sort: ${getSortLabel(sort, sortOrder)}`} size="sm">
            {SORT_OPTIONS.map(option => (
              <DropdownItem
                key={`${option.sort}-${option.sortOrder}`}
                onClick={() => {
                  setSort(option.sort);
                  setSortOrder(option.sortOrder);
                }}
              >
                {getSortLabel(option.sort, option.sortOrder)}
              </DropdownItem>
            ))}
          </Dropdown>

          {/* Reset Button */}
          <Button size="sm" color="gray" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </NavbarCollapse>
    </Navbar>
  );
}
