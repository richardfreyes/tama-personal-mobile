
import { APP_INFO } from '@/constants/appInfo';
import type { AboutStat, LegalRow } from '@/types/settings';
import { router } from 'expo-router';

export const STATS: AboutStat[] = [
  {
    value: 'Multiple',
    label: 'Currencies available',
    description: 'We handle transactions from all over the world. We plan to expand our service to other countries as we expand.',
    icon: 'globe',
  },
  {
    value: '100+',
    label: 'Partners',
    description: 'Over 100+ partners trust Tama to process their cross-border payments.',
    icon: 'users',
  },
  {
    value: '100K+',
    label: 'Unique Payers',
    description: 'Our payers can easily pay globally using our solutions.',
    icon: 'user',
  },
];

export const VERSION_ROWS = [
  { label: 'Version', value: APP_INFO.version },
  { label: 'Build Number', value: APP_INFO.buildNumber },
  { label: 'Environment', value: APP_INFO.environment },
  ...(APP_INFO.releaseDate ? [{ label: 'Release Date', value: APP_INFO.releaseDate }] : []),
];

export const LEGAL_ROWS: LegalRow[] = [
  {
    title: 'Terms & Conditions',
    icon: 'file-text',
    onPress: () => router.push('/settings/terms'),
  },
  {
    title: 'Privacy Policy',
    icon: 'lock',
    onPress: () => router.push('/settings/privacy'),
  },
  {
    title: 'Refund and Chargeback Policy',
    icon: 'refresh-cw',
    onPress: () => router.push('/settings/refund-policy'),
  },
  {
    title: 'Licenses',
    icon: 'clipboard',
    onPress: () => router.push('/settings/licenses'),
  },
];
