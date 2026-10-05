import { MAX_VISIBLE_INDICATORS } from '@/constants/monthlyBills';

export const getIndicatorSlots = (total: number): number[] => (
  Array.from({ length: Math.min(total, MAX_VISIBLE_INDICATORS) }, (_, index) => index)
);

export const getNearestBillIndexForSlot = (
  slotIndex: number,
  activeIndex: number,
  total: number,
): number => {
  const cycleStart = Math.floor(activeIndex / MAX_VISIBLE_INDICATORS) * MAX_VISIBLE_INDICATORS;
  const candidates = [
    cycleStart + slotIndex - MAX_VISIBLE_INDICATORS,
    cycleStart + slotIndex,
    cycleStart + slotIndex + MAX_VISIBLE_INDICATORS,
  ].filter((index) => index >= 0 && index < total);

  return candidates.reduce((nearestIndex, candidateIndex) => {
    const nearestDistance = Math.abs(nearestIndex - activeIndex);
    const candidateDistance = Math.abs(candidateIndex - activeIndex);

    return candidateDistance < nearestDistance ? candidateIndex : nearestIndex;
  });
};
