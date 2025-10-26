import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple component for testing
function HelloWorld() {
  return <div>Hello World</div>;
}

describe('Hello World - Vitest Unit Test', () => {
  it('should render hello world', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });
});
