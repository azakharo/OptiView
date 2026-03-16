import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '@/test/renderWithRouter';
import {FAB} from './FAB';

describe('FAB', () => {
  it('should render the FAB button', () => {
    renderWithRouter(<FAB />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have correct accessibility label', () => {
    renderWithRouter(<FAB />);
    expect(screen.getByLabelText('Upload new image')).toBeInTheDocument();
  });

  it('should have fixed positioning', () => {
    const {container} = renderWithRouter(<FAB />);
    const button = container.querySelector('button');
    expect(button).toHaveClass('fixed');
    expect(button).toHaveClass('right-6');
    expect(button).toHaveClass('bottom-6');
  });

  it('should render plus icon', () => {
    renderWithRouter(<FAB />);
    const svg = document.body.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have hover scale effect', () => {
    const {container} = renderWithRouter(<FAB />);
    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:scale-105');
  });
});
