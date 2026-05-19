import { describe, it, expect } from 'vitest';
import { add } from './math';

describe('add', () => {
  it('두 양수를 더할 수 있다', () => {
    expect(add(2, 3)).toBe(5);
  });
});
