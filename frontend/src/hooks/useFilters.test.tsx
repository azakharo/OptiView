import {renderHook, act} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {useFilters} from './useFilters';
import type {ReactNode} from 'react';

const wrapper = ({children}: {children: ReactNode}) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe('useFilters', () => {
  it('should return default filter values', () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    expect(result.current.genre).toBeUndefined();
    expect(result.current.rating).toBeUndefined();
    expect(result.current.sort).toBe('createdAt');
    expect(result.current.sortOrder).toBe('DESC');
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it('should set genre filter', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    await act(async () => {
      result.current.setGenre('Nature');
    });

    expect(result.current.genre).toBe('Nature');
    // Page should reset to 1 when genre changes
    expect(result.current.page).toBe(1);
  });

  it('should set rating filter', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    await act(async () => {
      result.current.setRating(4);
    });

    expect(result.current.rating).toBe(4);
    // Page should reset to 1 when rating changes
    expect(result.current.page).toBe(1);
  });

  it('should set sort field', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    await act(async () => {
      result.current.setSort('rating');
    });

    expect(result.current.sort).toBe('rating');
    // Page should reset to 1 when sort changes
    expect(result.current.page).toBe(1);
  });

  it('should set sort order', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    await act(async () => {
      result.current.setSortOrder('ASC');
    });

    expect(result.current.sortOrder).toBe('ASC');
    // Page should reset to 1 when sortOrder changes
    expect(result.current.page).toBe(1);
  });

  it('should set page', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    await act(async () => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
  });

  it('should reset filters to default values', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    // Change some filters
    await act(async () => {
      result.current.setGenre('Nature');
      result.current.setRating(5);
      result.current.setSort('rating');
      result.current.setPage(3);
    });

    expect(result.current.genre).toBe('Nature');
    expect(result.current.rating).toBe(5);
    expect(result.current.sort).toBe('rating');
    expect(result.current.page).toBe(3); // Page set to 3 in setPage call

    // Reset filters
    await act(async () => {
      result.current.resetFilters();
    });

    expect(result.current.genre).toBeUndefined();
    expect(result.current.rating).toBeUndefined();
    expect(result.current.sort).toBe('createdAt');
    expect(result.current.sortOrder).toBe('DESC');
    expect(result.current.page).toBe(1);
  });

  it('should set page size and reset page to 1', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    // Set page to something else first
    await act(async () => {
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);

    // Change page size - should reset page to 1
    await act(async () => {
      result.current.setPageSize(50);
    });

    expect(result.current.pageSize).toBe(50);
    expect(result.current.page).toBe(1);
  });

  it('should clear genre when set to undefined', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    // Set genre first
    await act(async () => {
      result.current.setGenre('Nature');
    });

    expect(result.current.genre).toBe('Nature');

    // Clear genre
    await act(async () => {
      result.current.setGenre(undefined);
    });

    expect(result.current.genre).toBeUndefined();
  });

  it('should clear rating when set to undefined', async () => {
    const {result} = renderHook(() => useFilters(), {wrapper});

    // Set rating first
    await act(async () => {
      result.current.setRating(4);
    });

    expect(result.current.rating).toBe(4);

    // Clear rating
    await act(async () => {
      result.current.setRating(undefined);
    });

    expect(result.current.rating).toBeUndefined();
  });
});
