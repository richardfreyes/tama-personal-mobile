import { bulletLinePattern, numberedListPattern, romanListPattern, sectionHeadingPattern, shortHeadingPattern, shortLetteredHeadingMaxLength, subheadingPattern, trailingUrlPunctuationPattern } from '@/constants/legalDocument';
import { legalStyles as styles } from '@/styles/app/settings/legal';
import { Linking } from 'react-native';

export const getDocumentLines = (content: string) => (
  content
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim().length > 0)
);

export const getLineStyle = (line: string, index: number) => {
  if (index === 0) return styles.updatedAt;
  if (index === 1) return styles.documentTitle;
  if (sectionHeadingPattern.test(line)) return styles.sectionHeading;
  if (subheadingPattern.test(line) && line.length <= shortLetteredHeadingMaxLength) return styles.subheading;
  if (shortHeadingPattern.test(line) && line.length <= 64) return styles.subheading;
  if (subheadingPattern.test(line) || romanListPattern.test(line) || numberedListPattern.test(line)) return styles.listLine;
  return styles.paragraph;
};

export const getLineWeight = (line: string, index: number) => {
  if (index === 1 || sectionHeadingPattern.test(line)) return '700';
  if (
    (subheadingPattern.test(line) && line.length <= shortLetteredHeadingMaxLength) ||
    (shortHeadingPattern.test(line) && line.length <= 64)
  ) return '600';
  return 'regular';
};

export const getTableCells = (line: string) => line.split('\t').map(cell => cell.trim()).filter(Boolean);

export const getTableColumnWidth = (columnCount: number, index: number) => {
  if (columnCount === 4) return [120, 380, 170, 190][index] || 170;
  if (columnCount === 3) return [150, 280, 190][index] || 180;
  if (columnCount === 2) return [130, 620][index] || 180;
  return 180;
};

export const getBulletLevel = (line: string) => {
  const indent = line.match(bulletLinePattern)?.[1].length ?? 0;
  return Math.min(Math.floor(indent / 2), 2);
};

export const getContactUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes('@')) return `mailto:${value}`;
  return `tel:${value.replace(/[^\d+]/g, '')}`;
};

export const getLinkParts = (value: string) => {
  if (!/^https?:\/\//i.test(value)) {
    return {
      linkedText: value,
      trailingText: '',
      url: getContactUrl(value),
    };
  }

  const trailingText = value.match(trailingUrlPunctuationPattern)?.[0] ?? '';
  const linkedText = trailingText ? value.slice(0, -trailingText.length) : value;

  return {
    linkedText,
    trailingText,
    url: getContactUrl(linkedText),
  };
};

export const openContactLink = async (url: string) => {
  const isSupported = await Linking.canOpenURL(url);

  if (isSupported) {
    await Linking.openURL(url);
  }
};