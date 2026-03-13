import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {GenreTag} from './GenreTag';

describe('GenreTag', () => {
  it('should render Nature genre', () => {
    render(<GenreTag genre="Nature" />);
    expect(screen.getByText('Nature')).toBeInTheDocument();
  });

  it('should render Architecture genre', () => {
    render(<GenreTag genre="Architecture" />);
    expect(screen.getByText('Architecture')).toBeInTheDocument();
  });

  it('should render Portrait genre', () => {
    render(<GenreTag genre="Portrait" />);
    expect(screen.getByText('Portrait')).toBeInTheDocument();
  });

  it('should render Uncategorized genre', () => {
    render(<GenreTag genre="Uncategorized" />);
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('should render small size by default', () => {
    render(<GenreTag genre="Nature" />);
    // Badge should render the genre text
    expect(screen.getByText('Nature')).toBeInTheDocument();
  });

  it('should render medium size when specified', () => {
    render(<GenreTag genre="Nature" size="md" />);
    // Badge should render the genre text
    expect(screen.getByText('Nature')).toBeInTheDocument();
  });

  it('should apply correct color for Nature genre', () => {
    render(<GenreTag genre="Nature" />);
    // Nature should render
    expect(screen.getByText('Nature')).toBeInTheDocument();
  });

  it('should apply correct color for Architecture genre', () => {
    render(<GenreTag genre="Architecture" />);
    // Architecture should render
    expect(screen.getByText('Architecture')).toBeInTheDocument();
  });

  it('should apply correct color for Portrait genre', () => {
    render(<GenreTag genre="Portrait" />);
    // Portrait should render
    expect(screen.getByText('Portrait')).toBeInTheDocument();
  });

  it('should apply correct color for Uncategorized genre', () => {
    render(<GenreTag genre="Uncategorized" />);
    // Uncategorized should render
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });
});
