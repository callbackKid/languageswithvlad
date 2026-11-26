import { describe, expect, it } from 'vitest';

import { grade } from './grade';

describe('grade', () => {
  it('accepts the exact answer', () => {
    expect(grade('je parle', 'je parle')).toBe('ok');
  });
});
