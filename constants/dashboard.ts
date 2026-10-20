// Replaces constants/dashboard.ts
import { Colors } from '@/styles/common/colors';

export const DASHBOARD_RECENT_TRANSACTION_COUNT = 3;

export const DASHBOARD_BILL_CAROUSEL_GAP = 8;
export const DASHBOARD_BILL_PAGE_INSET = 16;

// Hero band: red → accent. Add a second LinearGradient on top for the #FFAD38 glow
// (Gradients.heroGlow in styles/theme/tokens.ts, start {x:1,y:0} → end {x:0.45,y:0.6}).
export const DASHBOARD_BILL_CARD_GRADIENT_COLORS = [Colors.red10, '#E2361C', Colors.accent] as const;
export const DASHBOARD_BILL_CARD_GRADIENT_LOCATIONS = [0, 0.55, 1] as const;
