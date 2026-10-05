import { describe, expect, it } from '@jest/globals';
import { getLetterIndexAtY, getLetterMagnification } from '@/utils/alphabetIndex';

describe('getLetterIndexAtY', () => {
  it('finds the letter under the finger', () => {
    expect(getLetterIndexAtY(0, 28, 5)).toBe(0);
    expect(getLetterIndexAtY(27, 28, 5)).toBe(0);
    expect(getLetterIndexAtY(28, 28, 5)).toBe(1);
    expect(getLetterIndexAtY(100, 28, 5)).toBe(3);
  });

  it('holds on the first and last letters when the finger slides off either end', () => {
    expect(getLetterIndexAtY(-40, 28, 5)).toBe(0);
    expect(getLetterIndexAtY(500, 28, 5)).toBe(4);
  });
});

describe('getLetterMagnification', () => {
  it('is full right under the finger', () => {
    expect(getLetterMagnification(70, 70, 28)).toBe(1);
  });

  it('is nothing two letters away or further', () => {
    expect(getLetterMagnification(14, 70, 28)).toBe(0);
    expect(getLetterMagnification(300, 70, 28)).toBe(0);
  });

  it('swells the neighbours less than the letter itself, and less the further away they are', () => {
    const next = getLetterMagnification(98, 70, 28);
    const afterThat = getLetterMagnification(112, 70, 28);

    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
    expect(afterThat).toBeGreaterThan(0);
    expect(afterThat).toBeLessThan(next);
  });

  it('treats above and below the finger the same', () => {
    expect(getLetterMagnification(56, 70, 28)).toBeCloseTo(getLetterMagnification(84, 70, 28));
  });
});
