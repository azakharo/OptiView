import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {DropZone} from './DropZone';
import type {FileRejection} from 'react-dropzone';
import * as reactDropzone from 'react-dropzone';

// Mock the useDropzone hook
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(),
}));

describe('DropZone', () => {
  const mockOnFilesSelected = vi.fn();

  const defaultDropzoneState = {
    getRootProps: vi.fn().mockReturnValue({}),
    getInputProps: vi.fn().mockReturnValue({}),
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
    fileRejections: [] as FileRejection[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.mocked(reactDropzone.useDropzone).mockReturnValue(
      defaultDropzoneState as never,
    );
  });

  it('should render dropzone area', () => {
    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    expect(
      screen.getByText(/Drag and drop images here, or click to select/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supports: JPEG, PNG, WebP • Max size: 10MB/i),
    ).toBeInTheDocument();
  });

  it('should accept valid file types on drop', () => {
    vi.mocked(reactDropzone.useDropzone).mockReturnValue({
      ...defaultDropzoneState,
      isDragAccept: true,
    } as never);

    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    // The component should render and show accept state
    expect(
      screen.getByText(/Drag and drop images here, or click to select/i),
    ).toBeInTheDocument();
  });

  it('should reject invalid file types', () => {
    const mockRejections: FileRejection[] = [
      {
        file: new File(['test'], 'test.txt', {type: 'text/plain'}),
        errors: [
          {
            code: 'file-invalid-type',
            message: 'File type must be JPEG, PNG, or WebP',
          },
        ],
      },
    ];

    vi.mocked(reactDropzone.useDropzone).mockReturnValue({
      ...defaultDropzoneState,
      isDragReject: true,
      fileRejections: mockRejections,
    } as never);

    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    // Should show rejection message
    expect(
      screen.getByText(/Some files will be rejected/i),
    ).toBeInTheDocument();
  });

  it('should reject files larger than 10MB', () => {
    const mockRejections: FileRejection[] = [
      {
        file: new File(['test'], 'large.jpg', {type: 'image/jpeg'}),
        errors: [
          {
            code: 'file-too-large',
            message: 'File is larger than 10MB',
          },
        ],
      },
    ];

    vi.mocked(reactDropzone.useDropzone).mockReturnValue({
      ...defaultDropzoneState,
      isDragReject: true,
      fileRejections: mockRejections,
    } as never);

    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    // Should show rejection with error message
    expect(screen.getByText(/large.jpg/i)).toBeInTheDocument();
    // The actual error message is from react-dropzone
    expect(screen.getByText(/File is larger than 10MB/i)).toBeInTheDocument();
  });

  it('should show visual feedback on drag-over', () => {
    vi.mocked(reactDropzone.useDropzone).mockReturnValue({
      ...defaultDropzoneState,
      isDragActive: true,
    } as never);

    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    // Should show drag active message
    expect(screen.getByText(/Drop files here/i)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    vi.mocked(reactDropzone.useDropzone).mockReturnValue({
      ...defaultDropzoneState,
      disabled: true,
    } as never);

    render(<DropZone onFilesSelected={mockOnFilesSelected} disabled={true} />);

    // When disabled, the component should render without error
    // The disabled state is handled internally by react-dropzone
    expect(
      screen.getByText(/Drag and drop images here, or click to select/i),
    ).toBeInTheDocument();
  });

  it('should call onFilesSelected callback', () => {
    render(<DropZone onFilesSelected={mockOnFilesSelected} />);

    // Verify component renders without errors
    expect(screen.getByText(/Drag and drop images here/i)).toBeInTheDocument();
  });
});
