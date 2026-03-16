import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '@/test/renderWithRouter';
import {UploadPage} from './UploadPage';
import type {UploadItemState} from '@/types/upload';
import type {Genre} from '@/api/types';

// Create mock file
const createMockFile = (name: string): File => {
  return new File(['test'], name, {type: 'image/jpeg'});
};

// Create mock upload item
const createMockItem = (
  id: string,
  filename: string,
  overrides: Partial<UploadItemState> = {},
): UploadItemState => ({
  id,
  file: createMockFile(filename),
  genre: 'Nature' as Genre,
  status: 'waiting',
  progress: 0,
  ...overrides,
});

// Mock useUploadQueue hook
vi.mock('../hooks/useUploadQueue', () => ({
  useUploadQueue: vi.fn(),
}));

import {useUploadQueue} from '../hooks/useUploadQueue';

const mockUseUploadQueue = useUploadQueue as ReturnType<typeof vi.fn>;

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseUploadQueue.mockReturnValue({
      items: [],
      isUploading: false,
      addFiles: vi.fn(),
      updateGenre: vi.fn(),
      updateCustomGenre: vi.fn(),
      removeItem: vi.fn(),
      uploadAll: vi.fn(),
      retryItem: vi.fn(),
    });
  });

  it('should render back to gallery link', () => {
    renderWithRouter(<UploadPage />);

    expect(screen.getByText(/Back to Gallery/i)).toBeInTheDocument();
  });

  it('should render dropzone', () => {
    renderWithRouter(<UploadPage />);

    expect(
      screen.getByText(/Drag and drop images here, or click to select/i),
    ).toBeInTheDocument();
  });

  it('should render upload queue', () => {
    renderWithRouter(<UploadPage />);

    expect(screen.getByText(/Upload Queue/i)).toBeInTheDocument();
  });

  it('should disable upload button when no waiting items', () => {
    mockUseUploadQueue.mockReturnValue({
      items: [],
      isUploading: false,
      addFiles: vi.fn(),
      updateGenre: vi.fn(),
      updateCustomGenre: vi.fn(),
      removeItem: vi.fn(),
      uploadAll: vi.fn(),
      retryItem: vi.fn(),
    });

    renderWithRouter(<UploadPage />);

    // Upload All button should be disabled
    const button = screen.getByRole('button', {name: /upload all/i});
    expect(button).toBeDisabled();
  });

  it('should show upload more button when all done', () => {
    mockUseUploadQueue.mockReturnValue({
      items: [
        createMockItem('1', 'image1.jpg', {status: 'done'}),
        createMockItem('2', 'image2.jpg', {status: 'done'}),
      ],
      isUploading: false,
      addFiles: vi.fn(),
      updateGenre: vi.fn(),
      updateCustomGenre: vi.fn(),
      removeItem: vi.fn(),
      uploadAll: vi.fn(),
      retryItem: vi.fn(),
    });

    renderWithRouter(<UploadPage />);

    expect(
      screen.getByRole('button', {name: /upload more/i}),
    ).toBeInTheDocument();
  });

  it('should show go to gallery button when all done', () => {
    mockUseUploadQueue.mockReturnValue({
      items: [
        createMockItem('1', 'image1.jpg', {status: 'done'}),
        createMockItem('2', 'image2.jpg', {status: 'done'}),
      ],
      isUploading: false,
      addFiles: vi.fn(),
      updateGenre: vi.fn(),
      updateCustomGenre: vi.fn(),
      removeItem: vi.fn(),
      uploadAll: vi.fn(),
      retryItem: vi.fn(),
    });

    renderWithRouter(<UploadPage />);

    expect(
      screen.getByRole('link', {name: /go to gallery/i}),
    ).toBeInTheDocument();
  });
});
