import type { Feather } from '@expo/vector-icons';
import type React from 'react';

export type FeatherIconName = React.ComponentProps<typeof Feather>['name'];
export type ContactActionType = 'email' | 'phone' | 'web';

export interface AboutStat {
  value: string;
  label: string;
  description: string;
  icon: FeatherIconName;
}

export interface LegalRow {
  title: string;
  icon: FeatherIconName;
  onPress: () => void;
}

export interface ContactChannel {
  action: ContactActionType;
  icon: 'facebook' | 'instagram' | 'mail' | 'phone';
  label: string;
  title: string;
  url: string;
}

export interface ContactSupportInfo {
  label: string;
  value: string;
}
