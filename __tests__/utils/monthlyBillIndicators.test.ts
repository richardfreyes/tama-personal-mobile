import { MAX_VISIBLE_INDICATORS } from '@/constants/monthlyBills';
import { getIndicatorSlots, getNearestBillIndexForSlot } from '@/utils/monthlyBillIndicators';
import { describe, expect, it } from '@jest/globals';

describe('monthlyBillIndicators', () => {
  it('caps the persistent indicator slots at six', () => {
    expect(MAX_VISIBLE_INDICATORS).toBe(6);
    expect(getIndicatorSlots(4)).toEqual([0, 1, 2, 3]);
    expect(getIndicatorSlots(32)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('maps the first slot to the next bill when the six-slot sequence restarts', () => {
    expect(getNearestBillIndexForSlot(0, 5, 32)).toBe(6);
  });

  it('keeps slot targets within the available bill range', () => {
    expect(getNearestBillIndexForSlot(5, 31, 32)).toBe(29);
  });
});
