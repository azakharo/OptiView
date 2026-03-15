import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {UploadItem} from './UploadItem';
import type {UploadItemState, UploadStatus} from '@/types/upload';
import type {Genre} from '@/api/types';

// Create mock file
const createMockFile = (name: string, type: string = 'image/jpeg'): File => {
  return new File(['test'], name, {type});
};

// Create mock upload item
const createMockItem = (
  overrides: Partial<UploadItemState> = {},
): UploadItemState => ({
  id: 'test-id-1',
  file: createMockFile('test-image.jpg'),
  genre: 'Nature' as Genre,
  status: 'waiting' as UploadStatus,
  progress: 0,
  ...overrides,
});

describe('UploadItem', () => {
  const mockOnGenreChange = vi.fn();
  const mockOnCustomGenreChange = vi.fn();
  const mockOnRetry = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display filename', () => {
    const item = createMockItem({file: createMockFile('my-test-image.jpg')});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText(/my-test-image.jpg/i)).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    const item = createMockItem({progress: 50});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Progress text should be visible
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('should show correct status indicator', () => {
    const item = createMockItem({status: 'done'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Should show done status (checkmark icon is present)
    expect(screen.getByRole('img', {hidden: true})).toBeInTheDocument();
  });

  it('should allow genre selection when waiting', () => {
    const item = createMockItem({status: 'waiting'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Genre select should be enabled
    const select = screen.getByRole('combobox');
    expect(select).not.toBeDisabled();
  });

  it('should disable genre selection when uploading', () => {
    const item = createMockItem({status: 'uploading'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    // Genre select should be disabled during upload
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should show retry button on error', () => {
    const item = createMockItem({
      status: 'error',
      error: 'Upload failed',
    });

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByRole('button', {name: /retry/i})).toBeInTheDocument();
  });

  it('should show remove button when waiting', () => {
    const item = createMockItem({status: 'waiting'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByRole('button', {name: /remove/i})).toBeInTheDocument();
  });

  it('should call onRetry when retry clicked', () => {
    const item = createMockItem({status: 'error'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: /retry/i}));
    expect(mockOnRetry).toHaveBeenCalledWith(item.id);
  });

  it('should call onRemove when remove clicked', () => {
    const item = createMockItem({status: 'waiting'});

    render(
      <UploadItem
        item={item}
        onGenreChange={mockOnGenreChange}
        onCustomGenreChange={mockOnCustomGenreChange}
        onRetry={mockOnRetry}
        onRemove={mockOnRemove}
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: /remove/i}));
    expect(mockOnRemove).toHaveBeenCalledWith(item.id);
  });
});
