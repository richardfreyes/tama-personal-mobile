// Replaces constants/gradients.ts — same export names, new brand stops.
import { Colors } from '@/styles/common/colors';

export const BRAND_ACTION_GRADIENT_COLORS = [Colors.red10, '#DC2818', Colors.brandGradientAction] as const;
export const BRAND_ACTION_GRADIENT_LOCATIONS = [0, 0.55, 1] as const;
export const BRAND_SOFT_GRADIENT_COLORS = [Colors.red01, Colors.dashboardGradientEnd] as const;
export const BRAND_RING_GRADIENT_COLORS = [Colors.red10, Colors.accent, Colors.highlight] as const;

export const GRADIENT_HORIZONTAL_START = { x: 0, y: 0.5 } as const;
export const GRADIENT_HORIZONTAL_END = { x: 1, y: 0.5 } as const;
export const GRADIENT_DIAGONAL_START = { x: 0, y: 0 } as const;
export const GRADIENT_DIAGONAL_END = { x: 1, y: 1 } as const;
