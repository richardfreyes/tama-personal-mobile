import type React from "react";

export type SettingRoute = '/settings/profile' | '/settings/security' | '/settings/about' | '/settings/contact' | 'payment-methods' | 'logout' | '/security/change-email' | '/security/change-password' | '#deactivationDeletion' | '#about' | '#help' | '#contact';

export interface rightNavProps {
  iconType?: 'more' | 'delete' | '';
  icon?: React.FC<any>;
  onPress?: () => void;
}

export interface NavHeaderProps {
  title?: string;
  onBackPress?: () => void | undefined;
  more?: boolean;
  rightNav?: rightNavProps | null;
  onMorePress?: () => void;
  logo?: boolean;
}
