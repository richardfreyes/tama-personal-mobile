import { ImageSourcePropType } from 'react-native';

export const LICENSE_LOGOS: {
  accessibilityLabel: string;
  source: ImageSourcePropType;
  width: number;
  height: number;
}[] = [
  {
    accessibilityLabel: 'PCI DSS compliant',
    source: require('@/assets/images/licenses/pci-dss.png'),
    width: 81,
    height: 64,
  },
  {
    accessibilityLabel: 'Bangko Sentral ng Pilipinas',
    source: require('@/assets/images/licenses/bangko-sentral-ng-pilipinas.png'),
    width: 65,
    height: 64,
  },
  {
    accessibilityLabel: 'Financial Crimes Enforcement Network',
    source: require('@/assets/images/licenses/fin-cen.png'),
    width: 65,
    height: 64,
  },
  {
    accessibilityLabel: 'Republic of the Philippines',
    source: require('@/assets/images/licenses/philippines-seal.png'),
    width: 65,
    height: 64,
  },
  {
    accessibilityLabel: 'Securities and Exchange Commission',
    source: require('@/assets/images/licenses/sec.png'),
    width: 65,
    height: 64,
  },
  {
    accessibilityLabel: 'National Privacy Commission',
    source: require('@/assets/images/licenses/national-privacy-commission.png'),
    width: 112,
    height: 64,
  },
  {
    accessibilityLabel: 'Anti-Money Laundering Council',
    source: require('@/assets/images/licenses/amlc.png'),
    width: 97,
    height: 64,
  },
];