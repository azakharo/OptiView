import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {Header} from './Header';

// Create mock functions at module level
const mockSetGenre = vi.fn();
const mockSetRating = vi.fn();
const mockSetSort = vi.fn();
const mockSetSortOrder = vi.fn();
const mockResetFilters = vi.fn();

// Mock the useFilters hook
vi.mock('../../hooks/useFilters', () => ({
  useFilters: vi.fn(() => ({
    genre: undefined,
    rating: undefined,
    sort: 'createdAt',
    sortOrder: 'DESC',
    setGenre: mockSetGenre,
    setRating: mockSetRating,
    setSort: mockSetSort,
    setSortOrder: mockSetSortOrder,
    resetFilters: mockResetFilters,
  })),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header with OptiView brand', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText('OptiView')).toBeInTheDocument();
  });

  it('should render genre filter dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByLabelText('Genre:')).toBeInTheDocument();
  });

  it('should render rating filter dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByLabelText('Rating:')).toBeInTheDocument();
  });

  it('should render sort dropdown', () => {
    renderWithRouter(<Header />);
    expect(screen.getByText(/Sort: createdAt DESC/i)).toBeInTheDocument();
  });

  it('should render reset button', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('button', {name: /reset/i})).toBeInTheDocument();
  });

  it('should have All Genres as default option', () => {
    renderWithRouter(<Header />);
    const genreSelect = screen.getByLabelText('Genre:');
    expect(genreSelect.value).toBe('');
    expect(
      screen.getByRole('option', {name: 'All Genres'}),
    ).toBeInTheDocument();
  });

  it('should have Any Rating as default option', () => {
    renderWithRouter(<Header />);
    const ratingSelect = screen.getByLabelText('Rating:');
    expect(ratingSelect.value).toBe('');
    expect(
      screen.getByRole('option', {name: 'Any Rating'}),
    ).toBeInTheDocument();
  });

  it('should render genre options', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('option', {name: 'Nature'})).toBeInTheDocument();
    expect(
      screen.getByRole('option', {name: 'Architecture'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Portrait'})).toBeInTheDocument();
    expect(
      screen.getByRole('option', {name: 'Uncategorized'}),
    ).toBeInTheDocument();
  });

  it('should render rating options', () => {
    renderWithRouter(<Header />);
    expect(screen.getByRole('option', {name: '5 Stars'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: '4+ Stars'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: '3+ Stars'})).toBeInTheDocument();
  });

  it('should call setGenre when genre is changed', async () => {
    renderWithRouter(<Header />);
    const genreSelect = screen.getByLabelText('Genre:');
    await fireEvent.change(genreSelect, {target: {value: 'Nature'}});

    expect(mockSetGenre).toHaveBeenCalledWith('Nature');
  });

  it('should call setRating when rating is changed', async () => {
    renderWithRouter(<Header />);
    const ratingSelect = screen.getByLabelText('Rating:');
    await fireEvent.change(ratingSelect, {target: {value: '4'}});

    expect(mockSetRating).toHaveBeenCalledWith(4);
  });

  it('should call resetFilters when reset button is clicked', async () => {
    renderWithRouter(<Header />);
    const resetButton = screen.getByRole('button', {name: /reset/i});
    await fireEvent.click(resetButton);

    expect(mockResetFilters).toHaveBeenCalled();
  });
});
