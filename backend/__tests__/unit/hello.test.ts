import { describe, it, expect } from '@jest/globals';

describe('Hello World - Jest Backend Unit Test', () => {
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string concatenation', () => {
    const greeting = 'Hello' + ' ' + 'World';
    expect(greeting).toBe('Hello World');
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
