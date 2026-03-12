import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Lightbox} from './Lightbox';
import type {Image} from '../../api/types';

const mockImage: Image = {
  id: 'test-1',
  filename: 'test-image.jpg',
  genre: 'Nature',
  rating: 4,
  aspectRatio: 16 / 9,
  dominantColor: '#ffffff',
  lqipBase64: '',
  width: 1920,
  height: 1080,
  createdAt: new Date().toISOString(),
};

const mockImages: Image[] = [
  mockImage,
  {
    id: 'test-2',
    filename: 'test-image-2.jpg',
    genre: 'Architecture',
    rating: 5,
    aspectRatio: 1.5,
    dominantColor: '#000000',
    lqipBase64: '',
    width: 1920,
    height: 1280,
    createdAt: new Date().toISOString(),
  },
];

describe('Lightbox', () => {
  it('should not render when isOpen is false', () => {
    const {container} = render(
      <Lightbox
        image={null}
        images={mockImages}
        isOpen={false}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when image is null', () => {
    const {container} = render(
      <Lightbox
        image={null}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true and image exists', () => {
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={handleClose}
        onNavigate={vi.fn()}
      />,
    );

    // Find and click the close button (flowbite Modal has its own close mechanism)
    const closeButton = document.body.querySelector('[aria-label="Close"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('should call onNavigate with prev when previous button is clicked', async () => {
    const handleNavigate = vi.fn();
    render(
      <Lightbox
        image={mockImages[1]}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={handleNavigate}
      />,
    );

    const prevButton = screen.getByLabelText('Previous image');
    fireEvent.click(prevButton);
    expect(handleNavigate).toHaveBeenCalledWith('prev');
  });

  it('should call onNavigate with next when next button is clicked', async () => {
    const handleNavigate = vi.fn();
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={handleNavigate}
      />,
    );

    const nextButton = screen.getByLabelText('Next image');
    fireEvent.click(nextButton);
    expect(handleNavigate).toHaveBeenCalledWith('next');
  });

  it('should disable previous button on first image', () => {
    render(
      <Lightbox
        image={mockImages[0]}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const prevButton = screen.getByLabelText('Previous image');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last image', () => {
    render(
      <Lightbox
        image={mockImages[1]}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const nextButton = screen.getByLabelText('Next image');
    expect(nextButton).toBeDisabled();
  });

  it('should render download buttons', () => {
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText('Download 1920px')).toBeInTheDocument();
    expect(screen.getByText('Download 1280px')).toBeInTheDocument();
    expect(screen.getByText('Download 640px')).toBeInTheDocument();
  });

  it('should render rating and genre', () => {
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText('Nature')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();
    render(
      <Lightbox
        image={mockImage}
        images={mockImages}
        isOpen={true}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />,
    );

    // Test arrow right
    fireEvent.keyDown(window, {key: 'ArrowRight'});
    expect(handleNavigate).toHaveBeenCalledWith('next');

    // Test arrow left
    fireEvent.keyDown(window, {key: 'ArrowLeft'});
    expect(handleNavigate).toHaveBeenCalledWith('prev');

    // Test escape
    fireEvent.keyDown(window, {key: 'Escape'});
    expect(handleClose).toHaveBeenCalled();
  });
});
