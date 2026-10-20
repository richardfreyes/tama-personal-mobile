import type { Colors } from '@/styles/common/colors';

export type ThemeColors = { [Key in keyof typeof Colors]: string };
