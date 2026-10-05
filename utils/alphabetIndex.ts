import { BILLER_INDEX_MAGNIFY_RADIUS } from '@/constants/billerDirectory';

export const getLetterIndexAtY = (y: number, letterHeight: number, letterCount: number): number => {
  'worklet';
  return Math.max(0, Math.min(letterCount - 1, Math.floor(y / letterHeight)));
};

export const getLetterMagnification = (letterCenterY: number, touchY: number, letterHeight: number): number => {
  'worklet';
  const distance = Math.abs(letterCenterY - touchY) / (letterHeight * BILLER_INDEX_MAGNIFY_RADIUS);
  if (distance >= 1) {
    return 0;
  }

  const bell = 0.5 * (1 + Math.cos(Math.PI * distance));
  return bell * bell;
};
