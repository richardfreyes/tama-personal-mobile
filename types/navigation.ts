import type React from "react";
import type { Href } from 'expo-router';

export type NavigationRoute = Extract<Href, string>;

export type SettingRoute = '/settings/profile' | '/settings/security' | '/settings/about' | '/settings/contact' | 'payment-methods' | 'logout' | '/security/change-email' | '/security/change-password' | '#deactivationDeletion' | '#about' | '#help' | '#contact';

export interface rightNavProps {
  iconType?: 'more' | 'delete' | '';
  icon?: React.FC<any>;
  onPress?: () => void;

  accessibilityLabel?: string;
}

export interface NavHeaderProps {
  title?: string;
  onBackPress?: () => void | undefined;
  more?: boolean;
  rightNav?: rightNavProps | null;
  onMorePress?: () => void;
  logo?: boolean;

  variant?: 'default' | 'outlined';
}

export interface OneTimePaymentMethodRouteParams {

  title: string;
  billingReferenceId?: string;
  baseAmount?: string;
  baseCurrency?: string;

  returnTo?: string;
  returnAmount?: string;
}
