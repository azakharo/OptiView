import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {GalleryPage} from './GalleryPage';

// Mock hooks
vi.mock('../hooks/useFilters', () => ({
  useFilters: () => ({
    genre: undefined,
    rating: undefined,
    sort: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    pageSize: 20,
  }),
}));

vi.mock('../hooks/useImages', () => ({
  useImages: vi.fn(),
  queryKeys: {
    images: () => ['images'],
  },
}));

vi.mock('../components/Header/Header', () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('../components/Gallery/Gallery', () => ({
  Gallery: ({onImageClick}: {onImageClick: (img: unknown) => void}) => (
    <div data-testid="gallery">
      <button
        onClick={() => onImageClick({id: 'test-1', filename: 'test.jpg'})}
      >
        Click Image
      </button>
    </div>
  ),
}));

vi.mock('../components/Gallery/Lightbox', () => ({
  Lightbox: ({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) =>
    isOpen ? (
      <div data-testid="lightbox">
        <button onClick={onClose}>Close Lightbox</button>
      </div>
    ) : null,
}));

vi.mock('../components/FAB/FAB', () => ({
  FAB: () => <div data-testid="fab">FAB</div>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GalleryPage', () => {
  it('should render the page with header', async () => {
    const {useImages} = await import('../hooks/useImages');
    vi.mocked(useImages).mockReturnValue({
      data: {data: [], pagination: {totalItems: 0, totalPages: 0}},
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useImages>);

    renderWithRouter(<GalleryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });

  it('should render the gallery component', async () => {
    const {useImages} = await import('../hooks/useImages');
    vi.mocked(useImages).mockReturnValue({
      data: {data: [], pagination: {totalItems: 0, totalPages: 0}},
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useImages>);

    renderWithRouter(<GalleryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('gallery')).toBeInTheDocument();
    });
  });

  it('should render the FAB', async () => {
    const {useImages} = await import('../hooks/useImages');
    vi.mocked(useImages).mockReturnValue({
      data: {data: [], pagination: {totalItems: 0, totalPages: 0}},
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useImages>);

    renderWithRouter(<GalleryPage />);
    await waitFor(() => {
      expect(screen.getByTestId('fab')).toBeInTheDocument();
    });
  });

  it('should have correct container classes', async () => {
    const {useImages} = await import('../hooks/useImages');
    vi.mocked(useImages).mockReturnValue({
      data: {data: [], pagination: {totalItems: 0, totalPages: 0}},
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useImages>);

    const {container} = renderWithRouter(<GalleryPage />);
    await waitFor(() => {
      expect(container.firstChild).toHaveClass('min-h-screen');
    });
  });
});
