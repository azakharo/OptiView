import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UploadQueue} from './UploadQueue';
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

describe('UploadQueue', () => {
  const mockOnGenreChange = vi.fn();
  const mockOnCustomGenreChange = vi.fn();
  const mockOnRetry = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of upload items', () => {
    const items = [
      createMockItem('1', 'image1.jpg'),
      createMockItem('2', 'image2.jpg'),
    ];

    render(
      <UploadQueue
        items={items}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText(/image1.jpg/i)).toBeInTheDocument();
    expect(screen.getByText(/image2.jpg/i)).toBeInTheDocument();
  });

  it('should show empty state when no items', () => {
    render(
      <UploadQueue
        items={[]}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    expect(
      screen.getByText(
        /No files in queue. Drop files above to start uploading./i,
      ),
    ).toBeInTheDocument();
  });

  it('should show upload summary', () => {
    const items = [
      createMockItem('1', 'image1.jpg', {status: 'done'}),
      createMockItem('2', 'image2.jpg', {status: 'waiting'}),
      createMockItem('3', 'image3.jpg', {status: 'done'}),
    ];

    render(
      <UploadQueue
        items={items}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Should show "2 of 3 uploads complete"
    expect(screen.getByText(/2 of 3 uploads complete/i)).toBeInTheDocument();
  });

  it('should pass callbacks to items', () => {
    const items = [createMockItem('1', 'image1.jpg')];

    render(
      <UploadQueue
        items={items}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Items should render with genre select present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
